#requires -Version 7.0
[CmdletBinding()]
param(
    [string]$SessionRoot = (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex\sessions'),
    [ValidateRange(1, 3650)]
    [int]$Days = 7,
    [ValidateRange(1, 1000)]
    [int]$MaxSessions = 100,
    [switch]$SubagentsOnly,
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-NestedValue {
    param(
        [AllowNull()][object]$InputObject,
        [Parameter(Mandatory)][string]$Path
    )

    $current = $InputObject
    foreach ($segment in $Path.Split('.')) {
        if ($null -eq $current) { return $null }
        $property = $current.PSObject.Properties[$segment]
        if ($null -eq $property) { return $null }
        $current = $property.Value
    }
    return $current
}

function Read-CodexRollout {
    param([Parameter(Mandatory)][string]$Path)

    $stream = $null
    $reader = $null
    $meta = $null
    $firstContext = $null
    $lastContext = $null
    $lastToken = $null
    $parseErrors = 0
    $spawnCalls = [System.Collections.Generic.List[object]]::new()
    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete

    try {
        $stream = [System.IO.File]::Open(
            $Path,
            [System.IO.FileMode]::Open,
            [System.IO.FileAccess]::Read,
            $share
        )
        $reader = [System.IO.StreamReader]::new($stream)

        while (($line = $reader.ReadLine()) -ne $null) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            try {
                $record = $line | ConvertFrom-Json -Depth 100
            }
            catch {
                # A live JSONL can expose an incomplete final line. Skip it safely.
                $parseErrors++
                continue
            }

            $recordType = Get-NestedValue $record 'type'
            $payloadType = Get-NestedValue $record 'payload.type'

            if ($recordType -eq 'session_meta' -and $null -eq $meta) {
                $meta = Get-NestedValue $record 'payload'
                continue
            }
            if ($recordType -eq 'turn_context') {
                if ($null -eq $firstContext) {
                    $firstContext = Get-NestedValue $record 'payload'
                }
                $lastContext = Get-NestedValue $record 'payload'
                continue
            }
            if ($recordType -eq 'event_msg' -and $payloadType -eq 'token_count') {
                $lastToken = Get-NestedValue $record 'payload.info.total_token_usage'
                continue
            }
            if ($recordType -ne 'response_item' -or
                $payloadType -notin @('function_call', 'custom_tool_call')) {
                continue
            }

            $toolName = Get-NestedValue $record 'payload.name'
            if (-not $toolName) { $toolName = Get-NestedValue $record 'payload.tool_name' }
            if ($toolName -notmatch '(^|\.)spawn_agent$') { continue }

            $rawArguments = Get-NestedValue $record 'payload.arguments'
            if (-not $rawArguments) { $rawArguments = Get-NestedValue $record 'payload.input' }
            if (-not $rawArguments) { continue }

            try {
                $arguments = if ($rawArguments -is [string]) {
                    $rawArguments | ConvertFrom-Json -Depth 30
                }
                else {
                    $rawArguments
                }
                $spawnCalls.Add([pscustomobject]@{
                    Time            = Get-NestedValue $record 'timestamp'
                    TaskName        = Get-NestedValue $arguments 'task_name'
                    AgentType       = Get-NestedValue $arguments 'agent_type'
                    RequestedModel  = Get-NestedValue $arguments 'model'
                    RequestedEffort = Get-NestedValue $arguments 'reasoning_effort'
                    ForkTurns       = Get-NestedValue $arguments 'fork_turns'
                })
            }
            catch {
                # Spawn metadata is diagnostic; malformed/encrypted task content is ignored.
            }
        }
    }
    finally {
        if ($null -ne $reader) { $reader.Dispose() }
        elseif ($null -ne $stream) { $stream.Dispose() }
    }

    [pscustomobject]@{
        Meta        = $meta
        FirstContext = $firstContext
        LastContext = $lastContext
        LastToken   = $lastToken
        SpawnCalls  = $spawnCalls.ToArray()
        ParseErrors = $parseErrors
    }
}

function Get-RoleConfiguration {
    param(
        [AllowNull()][string]$Role,
        [Parameter(Mandatory)][string]$RepositoryRoot
    )

    if ([string]::IsNullOrWhiteSpace($Role)) {
        return [pscustomobject]@{ Model = $null; Effort = $null }
    }

    $configPath = Join-Path $RepositoryRoot ".codex\agents\$Role.toml"
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        return [pscustomobject]@{ Model = $null; Effort = $null }
    }

    $content = Get-Content -Raw -LiteralPath $configPath
    $modelMatch = [regex]::Match($content, '(?m)^\s*model\s*=\s*"([^"]+)"\s*$')
    $effortMatch = [regex]::Match($content, '(?m)^\s*model_reasoning_effort\s*=\s*"([^"]+)"\s*$')

    [pscustomobject]@{
        Model  = if ($modelMatch.Success) { $modelMatch.Groups[1].Value } else { $null }
        Effort = if ($effortMatch.Success) { $effortMatch.Groups[1].Value } else { $null }
    }
}

function Test-SameValue {
    param([AllowNull()][string]$Left, [AllowNull()][string]$Right)
    if ([string]::IsNullOrWhiteSpace($Left) -or [string]::IsNullOrWhiteSpace($Right)) {
        return $false
    }
    return $Left.Equals($Right, [System.StringComparison]::OrdinalIgnoreCase)
}

function Get-Sum {
    param([object[]]$Rows, [Parameter(Mandatory)][string]$Property)
    if ($Rows.Count -eq 0) { return [long]0 }
    return [long](($Rows | Measure-Object -Property $Property -Sum).Sum)
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$cutoff = (Get-Date).AddDays(-$Days)
$files = @()
if (Test-Path -LiteralPath $SessionRoot -PathType Container) {
    $files = @(
        Get-ChildItem -LiteralPath $SessionRoot -Recurse -File -Filter '*.jsonl' |
            Where-Object LastWriteTime -ge $cutoff |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First $MaxSessions
    )
}

$rawSessions = [System.Collections.Generic.List[object]]::new()
$allSpawns = [System.Collections.Generic.List[object]]::new()
$totalParseErrors = 0

foreach ($file in $files) {
    try {
        $rollout = Read-CodexRollout -Path $file.FullName
    }
    catch {
        $totalParseErrors++
        continue
    }
    $totalParseErrors += $rollout.ParseErrors
    if ($null -eq $rollout.Meta) { continue }

    $threadId = [string](Get-NestedValue $rollout.Meta 'id')
    if ([string]::IsNullOrWhiteSpace($threadId)) {
        $threadId = [string](Get-NestedValue $rollout.Meta 'session_id')
    }

    foreach ($spawn in $rollout.SpawnCalls) {
        $allSpawns.Add([pscustomobject]@{
            ParentThread     = $threadId
            Time             = $spawn.Time
            TaskName         = $spawn.TaskName
            AgentType        = $spawn.AgentType
            RequestedModel   = $spawn.RequestedModel
            RequestedEffort  = $spawn.RequestedEffort
            ForkTurns        = $spawn.ForkTurns
        })
    }

    $usage = $rollout.LastToken
    $inputTokens = [long]($(if ($null -ne $usage) { Get-NestedValue $usage 'input_tokens' } else { 0 }))
    $cachedTokens = [long]($(if ($null -ne $usage) { Get-NestedValue $usage 'cached_input_tokens' } else { 0 }))
    $outputTokens = [long]($(if ($null -ne $usage) { Get-NestedValue $usage 'output_tokens' } else { 0 }))
    $reasoningTokens = [long]($(if ($null -ne $usage) { Get-NestedValue $usage 'reasoning_output_tokens' } else { 0 }))
    $totalTokens = [long]($(if ($null -ne $usage) { Get-NestedValue $usage 'total_tokens' } else { 0 }))
    $uncachedTokens = [Math]::Max([long]0, $inputTokens - $cachedTokens)

    $role = [string](Get-NestedValue $rollout.Meta 'agent_role')
    $nickname = [string](Get-NestedValue $rollout.Meta 'agent_nickname')
    $agentPath = [string](Get-NestedValue $rollout.Meta 'agent_path')
    $taskName = if ($agentPath) { ($agentPath -split '/')[-1] } else { $null }
    $parentThread = [string](Get-NestedValue $rollout.Meta 'parent_thread_id')
    if (-not $parentThread) {
        $parentThread = [string](Get-NestedValue $rollout.Meta 'source.subagent.thread_spawn.parent_thread_id')
    }

    $timeValue = Get-NestedValue $rollout.Meta 'timestamp'
    if (-not $timeValue) { $timeValue = $file.LastWriteTime }

    $rawSessions.Add([pscustomobject]@{
        Time              = $timeValue
        ThreadId          = $threadId
        CliVersion        = [string](Get-NestedValue $rollout.Meta 'cli_version')
        ParentThread      = $parentThread
        Role              = $(if ($role) { $role } else { 'main' })
        Nickname          = $(if ($nickname) { $nickname } else { '-' })
        TaskName          = $taskName
        Model             = [string](Get-NestedValue $rollout.FirstContext 'model')
        Effort            = [string](Get-NestedValue $rollout.FirstContext 'effort')
        LastModel         = [string](Get-NestedValue $rollout.LastContext 'model')
        LastEffort        = [string](Get-NestedValue $rollout.LastContext 'effort')
        MultiAgentVersion = [string]($(if (Get-NestedValue $rollout.Meta 'multi_agent_version') { Get-NestedValue $rollout.Meta 'multi_agent_version' } else { Get-NestedValue $rollout.FirstContext 'multi_agent_version' }))
        Input             = $inputTokens
        Cached            = $cachedTokens
        Uncached          = $uncachedTokens
        Output            = $outputTokens
        Reasoning         = $reasoningTokens
        Total             = $totalTokens
        Rollout           = $file.FullName
    })
}

$sessions = [System.Collections.Generic.List[object]]::new()
foreach ($row in $rawSessions) {
    $spawn = $null
    if ($row.ParentThread -and $row.TaskName) {
        $spawn = $allSpawns |
            Where-Object { $_.ParentThread -eq $row.ParentThread -and $_.TaskName -eq $row.TaskName } |
            Sort-Object Time -Descending |
            Select-Object -First 1
    }
    $config = Get-RoleConfiguration -Role $row.Role -RepositoryRoot $repositoryRoot
    $requestedModel = if ($spawn) { [string]$spawn.RequestedModel } else { $null }
    $requestedEffort = if ($spawn) { [string]$spawn.RequestedEffort } else { $null }
    $expectedModel = if ($requestedModel) { $requestedModel } else { $config.Model }
    $expectedEffort = if ($requestedEffort) { $requestedEffort } else { $config.Effort }
    $reasons = [System.Collections.Generic.List[string]]::new()

    if ($expectedModel -and -not (Test-SameValue $expectedModel $row.Model)) {
        $reasons.Add("model expected=$expectedModel observed=$($row.Model)")
    }
    if ($expectedEffort -and -not (Test-SameValue $expectedEffort $row.Effort)) {
        $reasons.Add("effort expected=$expectedEffort observed=$($row.Effort)")
    }
    $solForbiddenRoles = @('game-explorer', 'game-worker', 'browser-playtester')
    if ($row.Role -in $solForbiddenRoles -and $row.Model -match 'sol' -and $expectedModel -notmatch 'sol') {
        $reasons.Add('unexpected Sol child for normal specialist role')
    }

    $routingStatus = if ($reasons.Count -gt 0) {
        'ROUTING_MISMATCH'
    }
    elseif ($expectedModel -or $expectedEffort) {
        'MATCH'
    }
    else {
        'NOT_EVALUATED'
    }

    $sessions.Add([pscustomobject]@{
        Time              = $row.Time
        ThreadId          = $row.ThreadId
        CliVersion        = $row.CliVersion
        ParentThread      = $row.ParentThread
        Role              = $row.Role
        Nickname          = $row.Nickname
        TaskName          = $row.TaskName
        Model             = $row.Model
        Effort            = $row.Effort
        LastModel         = $row.LastModel
        LastEffort        = $row.LastEffort
        MultiAgentVersion = $row.MultiAgentVersion
        RequestedModel    = $requestedModel
        RequestedEffort   = $requestedEffort
        ConfiguredModel   = $config.Model
        ConfiguredEffort  = $config.Effort
        ForkTurns         = $(if ($spawn) { $spawn.ForkTurns } else { $null })
        RoutingStatus     = $routingStatus
        RoutingReason     = ($reasons -join '; ')
        Input             = $row.Input
        Cached            = $row.Cached
        Uncached          = $row.Uncached
        Output            = $row.Output
        Reasoning         = $row.Reasoning
        Total             = $row.Total
        Rollout           = $row.Rollout
    })
}

$visibleSessions = @($sessions)
if ($SubagentsOnly) {
    $visibleSessions = @($visibleSessions | Where-Object ParentThread)
}
$visibleSessions = @($visibleSessions | Sort-Object Time -Descending)

$totals = [pscustomobject]@{
    TOTAL_INPUT     = Get-Sum $visibleSessions 'Input'
    TOTAL_CACHED    = Get-Sum $visibleSessions 'Cached'
    TOTAL_UNCACHED  = Get-Sum $visibleSessions 'Uncached'
    TOTAL_OUTPUT    = Get-Sum $visibleSessions 'Output'
    TOTAL_REASONING = Get-Sum $visibleSessions 'Reasoning'
    TOTAL           = Get-Sum $visibleSessions 'Total'
}

function Get-GroupedSummary {
    param([object[]]$Rows, [Parameter(Mandatory)][string]$Property)
    @(
        $Rows | Group-Object -Property $Property | ForEach-Object {
            $groupRows = @($_.Group)
            [pscustomobject]@{
                Name      = $(if ([string]::IsNullOrWhiteSpace($_.Name)) { '(unknown)' } else { $_.Name })
                Sessions  = $groupRows.Count
                Input     = Get-Sum $groupRows 'Input'
                Cached    = Get-Sum $groupRows 'Cached'
                Uncached  = Get-Sum $groupRows 'Uncached'
                Output    = Get-Sum $groupRows 'Output'
                Reasoning = Get-Sum $groupRows 'Reasoning'
                Total     = Get-Sum $groupRows 'Total'
            }
        } | Sort-Object Input -Descending
    )
}

$report = [pscustomobject]@{
    GeneratedAt      = (Get-Date).ToString('o')
    SessionRoot      = $SessionRoot
    WindowDays       = $Days
    MaxSessions      = $MaxSessions
    ParseWarnings    = $totalParseErrors
    Sessions         = $visibleSessions
    Totals           = $totals
    ByModel          = Get-GroupedSummary $visibleSessions 'Model'
    ByRole           = Get-GroupedSummary $visibleSessions 'Role'
    QuotaDisclaimer  = 'Codex token telemetry is diagnostic evidence; it is not a token-to-weekly-quota conversion.'
}

if ($Json) {
    $report | ConvertTo-Json -Depth 8
    return
}

Write-Output 'CODEX SESSION / SUBAGENT AUDIT'
Write-Output ($visibleSessions |
    Select-Object Time, ThreadId, ParentThread, Role, Nickname, Model, Effort,
        MultiAgentVersion |
    Format-Table -AutoSize | Out-String -Width 240)
Write-Output 'ROLLOUT / ROUTING'
Write-Output ($visibleSessions |
    Select-Object ThreadId, CliVersion, TaskName, RoutingStatus,
        @{Name='Rollout'; Expression={ Split-Path -Leaf $_.Rollout }} |
    Format-Table -AutoSize | Out-String -Width 240)
Write-Output 'TOKENS BY SESSION'
Write-Output ($visibleSessions |
    Select-Object Time, ThreadId, Input, Cached, Uncached, Output, Reasoning, Total |
    Format-Table -AutoSize | Out-String -Width 220)
Write-Output 'TOTALS'
Write-Output ($totals | Format-List | Out-String)
Write-Output 'BY MODEL'
Write-Output ($report.ByModel | Format-Table -AutoSize | Out-String)
Write-Output 'BY ROLE'
Write-Output ($report.ByRole | Format-Table -AutoSize | Out-String)

$mismatches = @($visibleSessions | Where-Object RoutingStatus -eq 'ROUTING_MISMATCH')
if ($mismatches.Count -gt 0) {
    Write-Output 'ROUTING MISMATCHES'
    foreach ($mismatch in $mismatches) {
        Write-Output ("{0} {1}/{2} requested={3}/{4} configured={5}/{6} observed={7}/{8} fork_turns={9}" -f
            $mismatch.ThreadId, $mismatch.Role, $mismatch.Nickname,
            $(if ($mismatch.RequestedModel) { $mismatch.RequestedModel } else { '-' }),
            $(if ($mismatch.RequestedEffort) { $mismatch.RequestedEffort } else { '-' }),
            $(if ($mismatch.ConfiguredModel) { $mismatch.ConfiguredModel } else { '-' }),
            $(if ($mismatch.ConfiguredEffort) { $mismatch.ConfiguredEffort } else { '-' }),
            $mismatch.Model, $mismatch.Effort,
            $(if ($mismatch.ForkTurns) { $mismatch.ForkTurns } else { '-' }))
        Write-Output "  reason=$($mismatch.RoutingReason)"
    }
}

if ($totalParseErrors -gt 0) {
    Write-Output "PARSE_WARNINGS=$totalParseErrors (incomplete/malformed JSONL lines skipped)"
}
Write-Output 'NOTE: Codex token telemetry is diagnostic evidence only. It is not a token-to-weekly-quota conversion.'

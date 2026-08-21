#requires -Version 7.0
[CmdletBinding()]
param(
    [ValidateRange(1, 3650)]
    [int]$Days = 7,
    [ValidateRange(1, 1000)]
    [int]$MaxSessions = 100,
    [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

function Invoke-VersionProbe {
    param([Parameter(Mandatory)][string]$Name)

    $command = Get-Command -Name $Name -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $command) {
        return [pscustomobject]@{
            Command = $Name
            Detected = $false
            Version  = $null
            Type     = $null
        }
    }

    $version = $null
    try {
        $lines = @(& $Name --version 2>&1 | ForEach-Object { [string]$_ })
        $version = ($lines | Where-Object { $_ } | Select-Object -First 3) -join ' | '
        if ([string]::IsNullOrWhiteSpace($version)) { $version = '(no version output)' }
    }
    catch {
        $version = "detected; --version failed: $($_.Exception.Message)"
    }

    [pscustomobject]@{
        Command = $Name
        Detected = $true
        Version  = $version
        Type     = [string]$command.CommandType
    }
}

function Get-AntigravityModels {
    param([Parameter(Mandatory)][object]$AgyStatus)

    if (-not $AgyStatus.Detected) {
        return [pscustomobject]@{ Status = 'ABSENT'; Command = $null; Models = @() }
    }

    try {
        $helpLines = @(& agy --help 2>&1 | ForEach-Object { [string]$_ })
        $help = $helpLines -join "`n"
        $match = [regex]::Match($help, '(?im)^\s*(models|list-models)\b')
        if (-not $match.Success) {
            return [pscustomobject]@{
                Status = 'MODEL_DISCOVERY_NOT_ADVERTISED_BY_LOCAL_HELP'
                Command = $null
                Models = @()
            }
        }

        $subcommand = $match.Groups[1].Value
        $modelLines = @(& agy $subcommand 2>&1 | ForEach-Object { [string]$_ })
        [pscustomobject]@{
            Status = 'LOCAL_MODEL_DISCOVERY_RAN'
            Command = "agy $subcommand"
            Models = @($modelLines | Where-Object { $_ } | Select-Object -First 50)
        }
    }
    catch {
        [pscustomobject]@{
            Status = "MODEL_DISCOVERY_FAILED: $($_.Exception.Message)"
            Command = $null
            Models = @()
        }
    }
}

$sessionRoot = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex\sessions'
$toolNames = @('codex', 'agy', 'pi', 'cx-minimax', 'mmx', 'opencode')
$tools = @($toolNames | ForEach-Object { Invoke-VersionProbe -Name $_ })
$codex = $tools | Where-Object Command -eq 'codex' | Select-Object -First 1
$agy = $tools | Where-Object Command -eq 'agy' | Select-Object -First 1
$pi = $tools | Where-Object Command -eq 'pi' | Select-Object -First 1
$cxMiniMax = $tools | Where-Object Command -eq 'cx-minimax' | Select-Object -First 1
$mmx = $tools | Where-Object Command -eq 'mmx' | Select-Object -First 1
$openCode = $tools | Where-Object Command -eq 'opencode' | Select-Object -First 1
$antigravityModels = Get-AntigravityModels -AgyStatus $agy

$auditPath = Join-Path $PSScriptRoot 'codex-subagent-audit.ps1'
$audit = $null
$auditError = $null
if (Test-Path -LiteralPath $auditPath -PathType Leaf) {
    try {
        $auditText = (& $auditPath -SessionRoot $sessionRoot -Days $Days -MaxSessions $MaxSessions -Json) -join "`n"
        $audit = $auditText | ConvertFrom-Json -Depth 20
    }
    catch {
        $auditError = $_.Exception.Message
    }
}
else {
    $auditError = "Audit script missing: $auditPath"
}

$recentModels = @()
$recentCodexVersions = @()
$routingMismatches = @()
if ($null -ne $audit) {
    $recentModels = @($audit.ByModel)
    $recentCodexVersions = @(
        $audit.Sessions |
            Group-Object CliVersion |
            ForEach-Object {
                [pscustomobject]@{
                    Version = $(if ($_.Name) { $_.Name } else { '(unknown)' })
                    Sessions = $_.Count
                }
            }
    )
    $routingMismatches = @(
        $audit.Sessions |
            Where-Object RoutingStatus -eq 'ROUTING_MISMATCH' |
            Select-Object Time, ThreadId, ParentThread, Role, Nickname,
                RequestedModel, RequestedEffort, ConfiguredModel,
                ConfiguredEffort, Model, Effort, ForkTurns, RoutingReason,
                Rollout
    )
}

$report = [pscustomobject]@{
    HarnessVersion = '2.1'
    GeneratedAt = (Get-Date).ToString('o')
    Codex = [pscustomobject]@{
        Detected = $codex.Detected
        Version = $codex.Version
        SessionDirectory = $sessionRoot
        SessionDirectoryExists = Test-Path -LiteralPath $sessionRoot -PathType Container
    }
    Commands = $tools
    GoogleAntigravity = [pscustomobject]@{
        Detected = $agy.Detected
        Version = $agy.Version
        RoutingStatus = 'CANDIDATE'
        ModelDiscovery = $antigravityModels
    }
    MiniMax = [pscustomobject]@{
        CodingHarnessDetected = $cxMiniMax.Detected
        CodingVersion = $cxMiniMax.Version
        CodingRole = 'TEMPORARY bounded Builder challenger'
        MediaHarnessDetected = $mmx.Detected
        MediaVersion = $mmx.Version
        MediaRole = 'preferred current image/voice/music/video provider'
        DependencyPolicy = 'Core repository contracts must survive subscription expiry.'
    }
    Pi = [pscustomobject]@{
        Detected = $pi.Detected
        Version = $pi.Version
        RoutingStatus = 'CANDIDATE; benchmark before promotion or cost claim'
    }
    OpenCode = [pscustomobject]@{
        Detected = $openCode.Detected
        Version = $openCode.Version
        RoutingStatus = 'OPTIONAL when locally available'
    }
    RecentEffectiveModels = $recentModels
    RecentCodexVersions = $recentCodexVersions
    RecentRoutingMismatches = $routingMismatches
    AuditError = $auditError
    QuotaDisclaimer = 'Token/session telemetry is diagnostic evidence and is not a weekly quota percentage.'
}

if ($Json) {
    $report | ConvertTo-Json -Depth 12
    return
}

Write-Output 'ROXANA HARNESS DOCTOR 2.1 (READ-ONLY)'
Write-Output "Codex version   : $($report.Codex.Version)"
Write-Output "Session dir     : $sessionRoot"
Write-Output "Session dir ok  : $($report.Codex.SessionDirectoryExists)"
if ($recentCodexVersions.Count -gt 0) {
    $versionLabels = @(
        $recentCodexVersions | ForEach-Object { '{0} ({1})' -f $_.Version, $_.Sessions }
    )
    Write-Output "Rollout versions: $($versionLabels -join ', ')"
}
Write-Output ''
Write-Output 'COMMANDS'
Write-Output ($tools | Format-Table Command, Detected, Version, Type -AutoSize | Out-String -Width 220)

Write-Output 'GOOGLE / ANTIGRAVITY'
Write-Output "Detected        : $($report.GoogleAntigravity.Detected)"
Write-Output "Version         : $($report.GoogleAntigravity.Version)"
Write-Output "Status          : CANDIDATE"
Write-Output "Model discovery : $($antigravityModels.Status)"
if ($antigravityModels.Models.Count -gt 0) {
    Write-Output ($antigravityModels.Models -join "`n")
}
Write-Output ''

Write-Output 'MINIMAX'
Write-Output "Coding detected : $($report.MiniMax.CodingHarnessDetected)"
Write-Output "Coding role     : $($report.MiniMax.CodingRole)"
Write-Output "Media detected  : $($report.MiniMax.MediaHarnessDetected)"
Write-Output "Media role      : $($report.MiniMax.MediaRole)"
Write-Output "Dependency      : $($report.MiniMax.DependencyPolicy)"
Write-Output ''

Write-Output 'PI'
Write-Output "Detected        : $($report.Pi.Detected)"
Write-Output "Status          : $($report.Pi.RoutingStatus)"
Write-Output ''

Write-Output 'RECENT EFFECTIVE MODELS'
if ($recentModels.Count -eq 0) {
    Write-Output '(none or audit unavailable)'
}
else {
    Write-Output ($recentModels | Format-Table Name, Sessions, Input, Cached, Uncached, Output, Reasoning -AutoSize | Out-String)
}

Write-Output 'RECENT ROUTING MISMATCHES'
if ($routingMismatches.Count -eq 0) {
    Write-Output '(none detected from available request/config/turn_context evidence)'
}
else {
    foreach ($mismatch in $routingMismatches) {
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

if ($auditError) { Write-Output "AUDIT_ERROR=$auditError" }
Write-Output 'NOTE: Tool detection does not prove login, quota or entitlement. No keys are read or printed.'
Write-Output 'NOTE: Token/session telemetry is diagnostic evidence only; it is not a weekly quota percentage.'

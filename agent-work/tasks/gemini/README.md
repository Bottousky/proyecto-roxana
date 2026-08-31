# Gemini peer tasks

These files are read-only analysis/review briefs for Antigravity CLI (`agy`).

Run them through the repo wrapper so the response is persisted under
`agent-work/reports/gemini/` and the run fails if the peer mutates the worktree:

```bash
npm run agent:gemini -- --task <task.md> --out agent-work/reports/gemini/<report.md> --effort high
```

Use `npm run agent:gemini:check` first and confirm the desired model slug with
`agy models`. Do not use Gemini API keys or `--dangerously-skip-permissions` for
this lane.

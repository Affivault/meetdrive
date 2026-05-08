# SkySend / Lemlist-style — Claude Workflow Instructions

## Repository
- **Repo:** `Affivault/lemlist-style`
- **Dev branch:** `claude/loving-maxwell-uiZQz` (always develop here)

## Daily Workflow (required every session)

1. **Diagnose** — read all source files under `client/src/`, `server/src/`, `shared/src/`, and `api/`; find real, concrete bugs (logic errors, missing error handling, unsafe nulls, type mismatches, memory/resource leaks, swallowed errors, etc.)
2. **Fix** — fix every confirmed issue in the code directly; skip anything that can't be resolved in code alone
3. **Improve** — make exactly one meaningful improvement per session (feature, UI, or UX) that makes a small but real difference to the SkySend app
4. **Commit** — commit all changes with a clear, descriptive message
5. **PR + Merge** — **always** create a pull request targeting `main` and merge it immediately after; never leave changes on the branch without a merged PR

## Merge behaviour
- Always squash-merge PRs into `main`
- PR title should summarise the day's work concisely
- PR body should include a table of bugs fixed and a description of the improvement

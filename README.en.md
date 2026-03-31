<div align="center">
  <img src="public/logo.png" alt="AnyCLI Logo" width="168" height="168" />
  <h1>AnyCLI</h1>
  <p>Agent-native CLI platform.</p>
  <p>
    <a href="README.md">简体中文</a>
  </p>
  <p>
    <a href="#how-agents-should-use-it-start-here">Agent usage</a> ·
    <a href="#website-pages">Website</a> ·
    <a href="#development">Development</a>
  </p>
</div>

## How agents should use it (start here)

The core flow is: **search for structured JSON → get an install command (dry-run by default) → execute only when confirmed**.

## What this is

AnyCLI turns CLI tools into **structured, agent-callable capability units**:

- **Unified metadata + examples**: with a consistent schema (install method, binary name, run examples, agent hints, docs), CLI tools become reusable capability entries.
- **A proxy/adapter layer for agents**: agents “talk to AnyCLI”, and AnyCLI shields downstream differences:
  - Upstream is unified: `anycli search/install` (with optional `--json` structured output)
  - Downstream is abstracted: brew/npm/pip/script installs, field differences, docs links, example command curation
  - Safer by default: `install` is dry-run first (returns the command), then execute only when confirmed

## Live preview

- **Preview URL**: `http://anycli.linklearner.com/`

### Screenshots

**Home**

![Home preview](docs/screenshots/home.png)

**Search / Explore**

![Search preview](docs/screenshots/search.png)

**Publish**

![Publish preview](docs/screenshots/publish.png)

**Admin**

![Admin preview](docs/screenshots/console.png)

Install:

```bash
npm i -g @lightcity/anycli
```

```bash
# 1) Exact lookup: slug -> minimal JSON
anycli search <slug> --json

# 2) Install: default is dry-run (prints command, does not run)
anycli install <slug> --json

# 3) Then execute after confirming it is safe
anycli install <slug> --yes --json
```

Prompt template you can paste into an AI agent:

```text
Please install and verify a CLI tool using AnyCLI safely. Follow these steps:
1) Make sure AnyCLI is installed:
   npm i -g @lightcity/anycli
2) Search for the tool:
   anycli search {{slug}} --json
3) Review the output and check example_usage. Pick the safest command for verification.
4) Install the tool safely:
   anycli install {{slug}} --json   # confirm this command is safe
   anycli install {{slug}} --yes    # execute installation
5) Run a minimal verification command to ensure the tool works (e.g., <binary> --help or a safe command from example_usage).
6) Summarize the output of the verification command.
```

For more templates, see `/docs` on the website.

## Website pages

- Explore: `/clis`
- Publish: `/publish` (requires admin review to be publicly listed)
- Docs: `/docs`
- About: `/about`

## Development

See `DEVELOPMENT.md`.


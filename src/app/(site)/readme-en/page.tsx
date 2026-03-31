import Link from "next/link";

export const metadata = {
  title: "README (English)",
};

export default function ReadmeEnPage() {
  return (
    <article className="max-w-3xl">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">README (EN)</span>
      </nav>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--foreground)]">AnyCLI — README (EN)</h1>
      <p className="mt-3 leading-relaxed text-[var(--muted)]">
        Agent-native CLI platform. For agent-first usage docs and prompt templates, see{" "}
        <Link href="/docs" className="font-medium text-[var(--accent)] hover:underline">
          /docs
        </Link>
        .
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">How agents should use it (start here)</h2>
        <p className="text-sm text-[var(--muted)]">
          Flow: search for structured JSON (includes <code className="font-mono">agentHints</code>) → get an install
          command (dry-run by default) → execute only when confirmed.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-[var(--elevated)] p-4 font-mono text-sm">{`# 1) Exact lookup: slug -> minimal JSON (includes agentHints)
anycli search <slug> --json

# 2) Install: default is dry-run (prints command, does not run)
anycli install <slug> --json

# 3) Then execute after confirming it is safe
anycli install <slug> --yes --json`}</pre>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Prompt template</h2>
        <pre className="overflow-x-auto rounded-xl bg-[var(--elevated)] p-4 font-mono text-sm whitespace-pre-wrap">{`Please install and verify tool slug=<slug> using anycli. Steps:
1) anycli search <slug> --json
2) Read agentHints/example_usage and pick the safest verification command
3) anycli install <slug> --json (confirm command is safe) then anycli install <slug> --yes
4) Run a minimal verification command (e.g. <binary> --help or a command from example_usage) and summarize the output.`}</pre>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Development</h2>
        <p className="text-sm text-[var(--muted)]">
          See <code className="font-mono">DEVELOPMENT.md</code> in the repo root.
        </p>
      </section>
    </article>
  );
}


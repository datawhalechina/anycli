#!/usr/bin/env node

import { Command } from "commander";
import { spawn } from "node:child_process";

function jsonFlag(opts: { json?: boolean }) {
  return Boolean(opts.json);
}

function baseUrl() {
  return process.env.ANYCLI_BASE_URL?.trim() || "https://anycli.linklearner.com";
}

async function postInternal<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, baseUrl()).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const err =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(err);
  }
  return data as T;
}

async function execCommand(command: string) {
  return await new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(command, { shell: true, stdio: ["inherit", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += String(d)));
    child.stderr.on("data", (d) => (stderr += String(d)));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });
}

const program = new Command();
program.name("anycli").description("AnyCLI: search & install CLI tools").option("--json", "output JSON");

program
  .command("search")
  .argument("<slug>")
  .action(async (slug: string, _opts, cmd) => {
    const s = slug.trim();
    if (!s) throw new Error("slug 不能为空");
    const out = await postInternal<{
      slug: string;
      name: string;
      install: { method: string | null; package: string | null; binary: string | null; command: string | null };
      agentHints: unknown | null;
    }>("/api/anycli/search", { slug: s });
    if (jsonFlag(cmd.parent?.opts?.() ?? {})) {
      process.stdout.write(JSON.stringify(out, null, 2));
      return;
    }
    process.stdout.write(`${out.slug}  ${out.name}\n`);
    if (out.install.command) process.stdout.write(`$ ${out.install.command}\n`);
  });

program
  .command("install")
  .argument("<slug>")
  .option("-y, --yes", "auto-confirm running install command")
  .action(async (slug: string, opts: { yes?: boolean }, cmd) => {
    const s = slug.trim();
    if (!s) throw new Error("slug 不能为空");
    const wantJson = jsonFlag(cmd.parent?.opts?.() ?? {});

    const out = await postInternal<{
      slug: string;
      name: string;
      install: { method: string | null; package: string | null; binary: string | null; command: string | null };
    }>("/api/anycli/install", { slug: s });
    if (!out.install.command) throw new Error("该条目缺少安装信息");

    if (!wantJson) {
      process.stdout.write(`CLI：${out.name}\n`);
      process.stdout.write(`安装命令：${out.install.command}\n`);
    }

    if (!opts.yes) {
      if (wantJson) {
        process.stdout.write(
          JSON.stringify(
            {
              status: "dry_run",
              slug: out.slug,
              name: out.name,
              install: out.install,
            },
            null,
            2,
          ),
        );
      }
      return;
    }

    const exec = await execCommand(out.install.command);
    if (wantJson) {
      process.stdout.write(
        JSON.stringify(
          {
            status: exec.exitCode === 0 ? "success" : "error",
            slug: out.slug,
            name: out.name,
            install: out.install,
            exec,
          },
          null,
          2,
        ),
      );
      return;
    }

    process.stdout.write(exec.stdout);
    if (exec.exitCode !== 0) {
      process.stderr.write(exec.stderr || "安装失败。\n");
      process.exitCode = exec.exitCode;
    }
  });

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`${err?.message || String(err)}\n`);
  process.exitCode = 1;
});


import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { installCommand } from "../../../src/lib/cli-json.ts";

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("script installation preserves the supplied command", () => {
  const command = 'node "installer with spaces.mjs" --flag "value with spaces"';
  assert.equal(installCommand({ installMethod: "script", installPackage: command, binaryName: "demo" }), command);
});

test("package-manager and unknown-method commands retain their existing format", () => {
  const cases = [
    ["brew", "ripgrep", "brew install ripgrep"],
    ["npm", "@scope/demo", "npm install -g @scope/demo"],
    ["pnpm", "demo", "pnpm add -g demo"],
    ["cargo", "demo", "cargo install demo"],
    ["pip", "demo", "pip install demo"],
    ["go", "example.com/demo@latest", "go install example.com/demo@latest"],
    ["uv", "tool install demo", "uv tool install demo"],
    ["custom-manager", "demo", "custom-manager demo"],
  ];
  for (const [installMethod, installPackage, expected] of cases) {
    assert.equal(installCommand({ installMethod, installPackage, binaryName: null }), expected);
  }
});

test("missing installation metadata still produces no command", () => {
  for (const [installMethod, installPackage] of [[null, "demo"], ["", "demo"], ["script", null], ["script", ""]]) {
    assert.equal(installCommand({ installMethod, installPackage, binaryName: null }), null);
  }
});

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "anycli-script-test-"));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith("anycli-script-test-"));
    await rm(directory, { recursive: true, force: true });
  });
  const marker = path.join(directory, "installed.json");
  await writeFile(path.join(directory, "installer fixture.cjs"), [
    'require("node:fs").writeFileSync("installed.json", JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2) }));',
    'process.stdout.write("installer completed\\n");',
  ].join("\n"));
  const command = `"${process.execPath}" "installer fixture.cjs" "value with spaces"`;
  const requests = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({ path: request.url, body: JSON.parse(body) });
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      slug: "demo", name: "Demo", agentHints: null,
      install: {
        method: "other", package: command, binary: "demo",
        command: installCommand({ installMethod: "script", installPackage: command, binaryName: "demo" }),
      },
    }));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const env = { ...process.env, ANYCLI_BASE_URL: `http://127.0.0.1:${server.address().port}` };

  function run(args) {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cliPath, ...args], {
        cwd: directory, env, timeout: 10000, stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "", stderr = "";
      child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
      child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
      child.once("error", reject);
      child.once("close", (code, signal) => resolve({ code, signal, stdout, stderr }));
    });
  }
  return { directory, marker, command, requests, run };
}

test("the real CLI search and dry-run expose the custom command without executing it", async t => {
  const f = await fixture(t);
  const search = await f.run(["search", "demo", "--json"]);
  const dryRun = await f.run(["install", "demo", "--json"]);
  assert.equal(search.code, 0, search.stderr);
  assert.equal(dryRun.code, 0, dryRun.stderr);
  await assert.rejects(readFile(f.marker), { code: "ENOENT" });
  assert.deepEqual(f.requests, [
    { path: "/api/anycli/search", body: { slug: "demo" } },
    { path: "/api/anycli/install", body: { slug: "demo" } },
  ]);
  assert.equal(JSON.parse(search.stdout).install.command, f.command);
  assert.equal(JSON.parse(dryRun.stdout).status, "dry_run");
  assert.equal(JSON.parse(dryRun.stdout).install.command, f.command);
});

test("the real CLI executes a custom installer in the caller's working directory", async t => {
  const f = await fixture(t);
  const result = await f.run(["install", "demo", "--yes"]);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /installer completed/);
  assert.deepEqual(JSON.parse(await readFile(f.marker, "utf8")), {
    cwd: f.directory, args: ["value with spaces"],
  });
});

test("the real CLI reports successful custom installation in JSON mode", async t => {
  const f = await fixture(t);
  const result = await f.run(["install", "demo", "--yes", "--json"]);
  assert.equal(result.code, 0, result.stderr);
  const out = JSON.parse(result.stdout);
  assert.equal(out.status, "success", result.stdout);
  assert.equal(out.exec.exitCode, 0);
  assert.equal(out.exec.stdout, "installer completed\n");
  assert.deepEqual(JSON.parse(await readFile(f.marker, "utf8")), {
    cwd: f.directory, args: ["value with spaces"],
  });
});

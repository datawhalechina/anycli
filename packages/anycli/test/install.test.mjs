import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../dist/index.js", import.meta.url));

async function install(t, { json, exitCode, confirm = true }) {
  const directory = await mkdtemp(join(tmpdir(), "anycli-install-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const marker = join(directory, "installer-ran");
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    assert.equal(request.method, "POST");
    assert.equal(request.url, "/api/anycli/install");
    assert.deepEqual(JSON.parse(body), { slug: "fixture" });
    const script = "require('node:fs').writeFileSync(process.env.ANYCLI_TEST_MARKER, 'ran'); "
      + "process.stdout.write('installer output'); process.stderr.write('installer diagnostic'); "
      + `process.exit(${exitCode})`;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      slug: "fixture",
      name: "Fixture CLI",
      install: { method: "other", package: null, binary: null, command: `"${process.execPath}" -e "${script}"` },
    }));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const args = [cli, "install", "fixture"];
  if (confirm) args.push("--yes");
  if (json) args.push("--json");
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ANYCLI_BASE_URL: `http://127.0.0.1:${server.address().port}`, ANYCLI_TEST_MARKER: marker },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const [code, signal] = await once(child, "close");
  assert.equal(signal, null);
  if (confirm) assert.equal(await readFile(marker, "utf8"), "ran");
  else await assert.rejects(readFile(marker), { code: "ENOENT" });
  return { code, stdout, stderr };
}

for (const json of [false, true]) {
  for (const exitCode of [0, 7]) {
    test(`${json ? "JSON" : "text"} install preserves installer exit code ${exitCode}`, { timeout: 15000 }, async (t) => {
      const result = await install(t, { json, exitCode });
      assert.equal(result.code, exitCode);
      if (json) {
        const output = JSON.parse(result.stdout);
        assert.equal(output.status, exitCode === 0 ? "success" : "error");
        assert.equal(output.exec.exitCode, exitCode);
        assert.equal(output.exec.stdout, "installer output");
        assert.equal(output.exec.stderr, "installer diagnostic");
        assert.equal(result.stderr, "");
      } else {
        assert.match(result.stdout, /installer output/);
        if (exitCode !== 0) assert.equal(result.stderr, "installer diagnostic");
      }
    });
  }
}

test("JSON dry run succeeds without starting the installer", { timeout: 15000 }, async (t) => {
  const result = await install(t, { json: true, exitCode: 7, confirm: false });
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).status, "dry_run");
  assert.equal(result.stderr, "");
});

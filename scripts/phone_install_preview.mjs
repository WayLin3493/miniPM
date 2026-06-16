import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.env.PORT || 3000);
const localBaseUrl = `http://127.0.0.1:${port}`;
const appUrl = `${localBaseUrl}/app/today`;
const children = new Set();
const once = process.argv.includes("--once") || process.env.CI === "true";

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false, ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function spawnChild(command, args, options = {}) {
  const child = spawn(command, args, { shell: false, ...options });
  children.add(child);
  child.on("exit", () => children.delete(child));
  return child;
}

async function requestOk(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function waitForUrl(url, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await requestOk(url, 3000)) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function findCloudflared() {
  const candidates = [];
  const where = spawnSync(process.platform === "win32" ? "where.exe" : "which", ["cloudflared"], { encoding: "utf8" });
  if (where.status === 0) {
    candidates.push(...where.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  }

  if (process.platform === "win32") {
    const wingetRoot = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
    if (fs.existsSync(wingetRoot)) {
      const stack = [wingetRoot];
      while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const fullPath = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (entry.name.toLowerCase().includes("cloudflare")) stack.push(fullPath);
          } else if (entry.name.toLowerCase() === "cloudflared.exe") {
            candidates.push(fullPath);
          }
        }
      }
    }
  }

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function ensureBuild() {
  const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
  if (fs.existsSync(buildIdPath)) return;
  console.log("No production build found. Building MiniPM...");
  run(npmCommand(), ["run", "build"]);
}

async function ensureAppServer() {
  if (await requestOk(appUrl)) {
    console.log(`MiniPM production server is already reachable at ${appUrl}`);
    return null;
  }

  console.log(`Starting MiniPM production server on port ${port}...`);
  const child = spawnChild(npmCommand(), ["run", "start", "--", "--hostname", "0.0.0.0", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  if (!(await waitForUrl(appUrl))) {
    throw new Error(`MiniPM did not become reachable at ${appUrl}`);
  }

  return child;
}

async function startTunnel(cloudflared) {
  console.log("Creating temporary HTTPS tunnel...");
  const child = spawnChild(cloudflared, ["tunnel", "--url", localBaseUrl], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  return await new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        reject(new Error("Timed out waiting for a trycloudflare.com URL"));
      }
    }, 60000);

    const inspect = (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match && !settled) {
        settled = true;
        clearTimeout(timeout);
        resolve({ child, url: match[0] });
      }
    };

    child.stdout.on("data", inspect);
    child.stderr.on("data", inspect);
    child.on("exit", (code) => {
      if (!settled) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited before creating a URL, code ${code}`));
      }
    });
  });
}

function cleanup() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});
process.on("exit", cleanup);

try {
  ensureBuild();
  await ensureAppServer();

  const cloudflared = findCloudflared();
  if (!cloudflared) {
    throw new Error("cloudflared was not found. Install it with: winget install --id Cloudflare.cloudflared");
  }

  const tunnel = await startTunnel(cloudflared);
  const baseUrl = tunnel.url;
  const phoneUrl = `${baseUrl}/app/today`;

  console.log("\nWaiting for the HTTPS tunnel to become reachable...");
  if (!(await waitForUrl(phoneUrl, 90000))) {
    throw new Error(`The HTTPS tunnel was created but ${phoneUrl} did not become reachable in time`);
  }

  console.log("\nChecking PWA install resources on the HTTPS tunnel...");
  run(process.execPath, ["scripts/check_pwa.mjs", baseUrl]);

  console.log("\nMiniPM is ready for phone installation:");
  console.log(phoneUrl);
  console.log("\nAndroid: open the URL in Chrome or Edge, then choose Install app or Add to Home screen.");
  console.log("iPhone: open the URL in Safari, tap Share, then Add to Home Screen.");

  if (once) {
    cleanup();
  } else {
    console.log("\nKeep this terminal running while installing. Press Ctrl+C to stop the temporary HTTPS tunnel.");
    await new Promise(() => undefined);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  cleanup();
  process.exit(1);
}

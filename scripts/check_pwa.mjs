const requiredIcons = new Set(["/icon-192.png", "/icon-512.png", "/maskable-icon-192.png", "/maskable-icon-512.png"]);

function normalizeBaseUrl(raw) {
  if (!raw) {
    throw new Error("Usage: npm run pwa:check -- https://your-domain.example");
  }
  return raw.replace(/\/+$/, "");
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response;
}

async function check(baseUrl) {
  const problems = [];
  const warnings = [];

  if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://localhost") && !baseUrl.startsWith("http://127.0.0.1")) {
    problems.push("PWA installation requires HTTPS, except localhost during development.");
  }

  const startPage = await request(`${baseUrl}/app/today`);
  const html = await startPage.text();
  if (!html.includes('rel="manifest"') && !html.includes("rel=manifest")) {
    problems.push("Start page is missing a manifest link.");
  }
  if (!html.includes("apple-touch-icon")) {
    warnings.push("Start page does not expose an apple-touch-icon link.");
  }

  const manifestResponse = await request(`${baseUrl}/manifest.webmanifest`);
  const manifest = await manifestResponse.json();
  if (manifest.start_url !== "/app/today") problems.push(`manifest.start_url should be /app/today, got ${manifest.start_url}`);
  if (manifest.display !== "standalone") problems.push(`manifest.display should be standalone, got ${manifest.display}`);
  if (!manifest.name || !manifest.short_name) problems.push("Manifest must include name and short_name.");
  if (manifest.prefer_related_applications !== false) problems.push("Manifest should set prefer_related_applications to false.");
  if (!Array.isArray(manifest.shortcuts) || manifest.shortcuts.length === 0) {
    warnings.push("Manifest does not include app shortcuts.");
  }

  const iconList = Array.isArray(manifest.icons) ? manifest.icons : [];
  for (const icon of requiredIcons) {
    if (!iconList.some((item) => item.src === icon)) {
      problems.push(`Manifest is missing ${icon}.`);
    }
    await request(`${baseUrl}${icon}`, { method: "GET" });
  }
  if (!iconList.some((item) => item.purpose === "maskable")) {
    problems.push("Manifest should include at least one maskable icon.");
  }

  const swResponse = await request(`${baseUrl}/sw.js`);
  const swText = await swResponse.text();
  if (!swText.includes("self.addEventListener(\"fetch\"")) {
    problems.push("Service worker does not include a fetch handler.");
  }
  if (!swText.includes("/offline")) {
    warnings.push("Service worker does not include an offline fallback page.");
  }

  await request(`${baseUrl}/offline`);

  return { manifest, problems, warnings };
}

try {
  const baseUrl = normalizeBaseUrl(process.argv[2]);
  const result = await check(baseUrl);
  console.log(`PWA check: ${baseUrl}`);
  console.log(`Name: ${result.manifest.name}`);
  console.log(`Start URL: ${result.manifest.start_url}`);
  console.log(`Display: ${result.manifest.display}`);

  for (const warning of result.warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (result.problems.length > 0) {
    for (const problem of result.problems) {
      console.error(`Error: ${problem}`);
    }
    process.exit(1);
  }

  console.log("PWA install resources look ready.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

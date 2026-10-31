// ==============================================================================
// IBS AI WORKFORCE — Automated GitHub Push Utility (Pure HTTPS REST API)
// Works on any machine without requiring git.exe to be installed!
// ==============================================================================

const fs = require("fs");
const path = require("path");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_USER = process.env.GITHUB_USERNAME || "hmspa1139-stack";
const REPO_NAME = "ibs-ai-workforce";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "venv",
  "__pycache__",
  ".pytest_cache",
  "dist",
  "build",
]);

const IGNORED_FILES = new Set([
  ".env.local",
  "desktop.ini",
  "Thumbs.db",
]);

async function githubRequest(endpoint, method = "GET", body = null) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "User-Agent": "IBS-AI-Workforce",
    Accept: "application/vnd.github+json",
  };
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${endpoint} failed (${res.status}): ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const item of list) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

    if (IGNORED_DIRS.has(item) || IGNORED_FILES.has(item)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      // Ignore files larger than 15MB
      if (stat.size < 15 * 1024 * 1024) {
        results.push({ fullPath, relPath, size: stat.size });
      }
    }
  }
  return results;
}

async function main() {
  console.log("=== IBS AI Workforce — GitHub Cloud Synchronizer ===");
  console.log(`Target: https://github.com/${GITHUB_USER}/${REPO_NAME}`);

  // 1. Check if repo exists
  let repo;
  try {
    repo = await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}`);
    console.log(`Repository found: ${repo.html_url}`);
  } catch (err) {
    console.log(`\nRepository "${REPO_NAME}" not found under ${GITHUB_USER}.`);
    console.log(`Please create it in 5 seconds at: https://github.com/new`);
    console.log(`Repository name: ${REPO_NAME}`);
    console.log(`Then re-run: node scripts/push-to-github.js\n`);
    process.exit(1);
  }

  // 2. Collect local files
  const rootDir = path.resolve(__dirname, "..");
  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} project files to synchronize.`);

  // 3. Upload blobs
  console.log("Creating Git blobs...");
  const treeItems = [];
  let count = 0;

  for (const file of files) {
    const content = fs.readFileSync(file.fullPath);
    const isText = !content.includes(0);

    const blobData = await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/blobs`, "POST", {
      content: content.toString(isText ? "utf8" : "base64"),
      encoding: isText ? "utf-8" : "base64",
    });

    treeItems.push({
      path: file.relPath,
      mode: "100644",
      type: "blob",
      sha: blobData.sha,
    });

    count++;
    if (count % 20 === 0 || count === files.length) {
      console.log(`  Uploaded ${count}/${files.length} files...`);
    }
  }

  // 4. Create Tree
  console.log("Creating Git tree...");
  const tree = await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/trees`, "POST", {
    tree: treeItems,
  });

  // 5. Check if main branch exists
  let parentCommitSha = null;
  try {
    const ref = await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/refs/heads/main`);
    parentCommitSha = ref.object.sha;
  } catch (e) {
    // Empty repo without commits yet
  }

  // 6. Create Commit
  console.log("Creating commit...");
  const commit = await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/commits`, "POST", {
    message: "feat: complete IBS AI Workforce full-stack cloud platform for Vercel",
    tree: tree.sha,
    parents: parentCommitSha ? [parentCommitSha] : [],
  });

  // 7. Update main branch reference
  console.log("Updating main branch reference...");
  if (parentCommitSha) {
    await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/refs/heads/main`, "PATCH", {
      sha: commit.sha,
      force: true,
    });
  } else {
    await githubRequest(`/repos/${GITHUB_USER}/${REPO_NAME}/git/refs`, "POST", {
      ref: "refs/heads/main",
      sha: commit.sha,
    });
  }

  console.log("\n SUCCESS! All files pushed to GitHub successfully!");
  console.log(`Repository URL: https://github.com/${GITHUB_USER}/${REPO_NAME}`);
  console.log(`\nNext step: Go to https://vercel.com, click "Add New Project", import "${REPO_NAME}", set Root Directory to "apps/web", and click Deploy!\n`);
}

main().catch((err) => {
  console.error("Sync Error:", err.message);
  process.exit(1);
});

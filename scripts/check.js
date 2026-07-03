const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const root = join(__dirname, "..");

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
    input: options.input,
    shell: false
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const commonJsFiles = [join(root, "server.js"), ...jsFiles(join(root, "server")), ...jsFiles(__dirname)];
const publicJsFiles = jsFiles(join(root, "public"));
const publicHtmlFiles = readdirSync(join(root, "public"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => join(root, "public", entry.name));

for (const file of commonJsFiles) {
  run(process.execPath, ["--check", file]);
}

for (const file of publicJsFiles) {
  run(process.execPath, ["--input-type=module", "--check"], {
    input: readFileSync(file, "utf8")
  });
}

let inlineScriptCount = 0;
for (const file of publicHtmlFiles) {
  const html = readFileSync(file, "utf8");
  const scripts = html.matchAll(/<script>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    inlineScriptCount += 1;
    run(process.execPath, ["--check"], { input: match[1] });
  }
}

console.log(`Checked ${commonJsFiles.length + publicJsFiles.length} JavaScript files and ${inlineScriptCount} inline script(s).`);

// Deploy to Vercel production, then point the public alias to the new deployment.
// ds-studio.vercel.app is a manual alias (it can't be added as a project domain),
// so every production deploy has to re-assign it.
// Usage: npm run release
const { execSync } = require("child_process");

const ALIAS = "ds-studio.vercel.app";
const run = (cmd) =>
  execSync(cmd, { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] });

console.log("Deploying to Vercel production...");
const output = run("npx --yes vercel@latest deploy --prod --yes");
const match = output.match(/https:\/\/[a-z0-9-]+\.vercel\.app/);
if (!match) {
  console.error("Could not find the deployment URL in the Vercel output:\n" + output);
  process.exit(1);
}

console.log("Deployment: " + match[0]);
console.log(run(`npx --yes vercel@latest alias set ${match[0]} ${ALIAS}`));
console.log("Live at https://" + ALIAS);

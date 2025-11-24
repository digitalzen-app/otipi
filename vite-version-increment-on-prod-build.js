import fs from "fs";
import path from "path";

const versionIncrementOnProdBuildPlugin = () => ({
  name: "version-increment-on-prod-build",
  apply: "build",
  closeBundle() {
    if (process.env.NODE_ENV === "production") {
      const packagePath = path.resolve(process.cwd(), "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
      const versionParts = packageJson.version.split(".").map((part) => parseInt(part, 10));

      // Increment patch version
      versionParts[2] += 1;

      packageJson.version = versionParts.join(".");

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`Version updated to: ${packageJson.version}`);
    }
  },
});

export default versionIncrementOnProdBuildPlugin;

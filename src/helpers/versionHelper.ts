export async function getVersion() {
    const packageJson = await import("../../package.json");
    return packageJson.version;
}

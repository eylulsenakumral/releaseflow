/**
 * GitHub release operations using gh CLI
 */
import { execaCommand } from 'execa';
/**
 * Create GitHub release
 */
export async function createGitHubRelease(version, notes, config) {
    const tagName = `${config.tagPrefix}${version}`;
    if (config.dryRun) {
        console.log(`[dry-run] Would create GitHub release ${tagName}`);
        console.log(`[dry-run] Release notes:\n${notes}`);
        return;
    }
    try {
        await execaCommand(`gh release create ${tagName} --notes "${notes.replace(/"/g, '\\"')}"`, {
            cwd: process.cwd(),
            stdio: 'inherit',
        });
    }
    catch (error) {
        // gh might not be authenticated or repo might not exist on GitHub
        console.warn('Warning: Could not create GitHub release. Is gh CLI authenticated?');
        console.warn(`Error: ${error.message}`);
    }
}
/**
 * Delete last GitHub release (for rollback)
 */
export async function deleteLastGitHubRelease(version, config) {
    const tagName = `${config.tagPrefix}${version}`;
    if (config.dryRun) {
        console.log(`[dry-run] Would delete GitHub release ${tagName}`);
        return true;
    }
    try {
        await execaCommand(`gh release delete ${tagName} --yes`, {
            cwd: process.cwd(),
            stdio: 'inherit',
        });
        return true;
    }
    catch {
        console.warn(`Could not delete GitHub release ${tagName}. It might not exist.`);
        return false;
    }
}
//# sourceMappingURL=github.js.map
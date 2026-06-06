/**
 * npm operations wrapper
 */

import { execaCommand } from 'execa';
import { ReleaseConfig } from './config.js';

/**
 * Publish to npm
 */
export async function publishToNpm(config: ReleaseConfig): Promise<void> {
  if (config.dryRun) {
    console.log('[dry-run] Would publish to npm');
    return;
  }

  // Use npm publish with --access public for scoped packages
  try {
    await execaCommand('npm publish --access public', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch (error: any) {
    // Check if it's a private package (non-scoped) error
    if (error.stderr?.includes('--access public')) {
      // Retry without --access public for non-scoped packages
      await execaCommand('npm publish', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } else {
      throw error;
    }
  }
}

/**
 * Get current version from package.json
 */
export async function getCurrentVersion(): Promise<string> {
  const { readPackageUp } = await import('read-pkg-up');
  const result = await readPackageUp();
  return result?.packageJson.version || '0.0.0';
}

/**
 * Update version in package.json
 */
export async function updatePackageVersion(version: string, config: ReleaseConfig): Promise<void> {
  if (config.dryRun) {
    console.log(`[dry-run] Would update package.json version to ${version}`);
    return;
  }

  await execaCommand(`npm version ${version} --no-git-tag-version`, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

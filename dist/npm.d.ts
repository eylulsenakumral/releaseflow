/**
 * npm operations wrapper
 */
import { ReleaseConfig } from './config.js';
/**
 * Publish to npm
 */
export declare function publishToNpm(config: ReleaseConfig): Promise<void>;
/**
 * Get current version from package.json
 */
export declare function getCurrentVersion(): Promise<string>;
/**
 * Update version in package.json
 */
export declare function updatePackageVersion(version: string, config: ReleaseConfig): Promise<void>;
//# sourceMappingURL=npm.d.ts.map
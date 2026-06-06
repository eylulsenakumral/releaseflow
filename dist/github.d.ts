/**
 * GitHub release operations using gh CLI
 */
import { ReleaseConfig } from './config.js';
/**
 * Create GitHub release
 */
export declare function createGitHubRelease(version: string, notes: string, config: ReleaseConfig): Promise<void>;
/**
 * Delete last GitHub release (for rollback)
 */
export declare function deleteLastGitHubRelease(version: string, config: ReleaseConfig): Promise<boolean>;
//# sourceMappingURL=github.d.ts.map
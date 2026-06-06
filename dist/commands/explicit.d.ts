/**
 * Explicit version bump commands (patch, minor, major)
 */
export interface ExplicitReleaseOptions {
    dryRun?: boolean;
    skipNpm?: boolean;
    skipGit?: boolean;
}
/**
 * Release with explicit version bump type
 */
export declare function explicitRelease(bumpType: 'patch' | 'minor' | 'major', options?: ExplicitReleaseOptions): Promise<void>;
//# sourceMappingURL=explicit.d.ts.map
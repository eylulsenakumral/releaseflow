/**
 * Main release command - auto-detect version bump from conventional commits
 */
export interface ReleaseOptions {
    dryRun?: boolean;
    skipNpm?: boolean;
    skipGit?: boolean;
}
/**
 * Main release flow
 */
export declare function release(options?: ReleaseOptions): Promise<void>;
//# sourceMappingURL=release.d.ts.map
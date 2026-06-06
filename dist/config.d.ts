/**
 * Zero-config release automation
 * Default config works for 90% of repos
 */
export interface ReleaseConfig {
    mainBranch: string;
    tagPrefix: string;
    changelogFile: string;
    dryRun: boolean;
}
/**
 * Load config from .releaserc.json if exists, otherwise use defaults
 */
export declare function loadConfig(cwd?: string): ReleaseConfig;
/**
 * Create config with dryRun override
 */
export declare function withDryRun(config: ReleaseConfig, dryRun: boolean): ReleaseConfig;
//# sourceMappingURL=config.d.ts.map
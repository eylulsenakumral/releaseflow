/**
 * Zero-config release automation
 * Default config works for 90% of repos
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
const DEFAULT_CONFIG = {
    mainBranch: 'main',
    tagPrefix: 'v',
    changelogFile: 'CHANGELOG.md',
    dryRun: false,
};
/**
 * Load config from .releaserc.json if exists, otherwise use defaults
 */
export function loadConfig(cwd = process.cwd()) {
    const configPath = join(cwd, '.releaserc.json');
    if (!existsSync(configPath)) {
        return DEFAULT_CONFIG;
    }
    try {
        const userConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
        return { ...DEFAULT_CONFIG, ...userConfig, dryRun: false }; // never persist dryRun
    }
    catch {
        return DEFAULT_CONFIG;
    }
}
/**
 * Create config with dryRun override
 */
export function withDryRun(config, dryRun) {
    return { ...config, dryRun };
}
//# sourceMappingURL=config.js.map
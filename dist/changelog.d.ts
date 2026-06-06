/**
 * Changelog generator for conventional commits
 */
import type { Commit } from './git.js';
export interface ChangelogSection {
    type: 'feat' | 'fix' | 'breaking' | 'other';
    title: string;
    commits: string[];
}
/**
 * Detect version bump type from commits
 */
export declare function detectVersionBump(commits: Commit[]): 'major' | 'minor' | 'patch' | 'none';
/**
 * Bump version based on type
 */
export declare function bumpVersion(current: string, type: 'major' | 'minor' | 'patch'): string;
/**
 * Group commits by type for changelog
 */
export declare function groupCommits(commits: Commit[]): ChangelogSection[];
/**
 * Generate changelog markdown
 */
export declare function generateChangelog(version: string, sections: ChangelogSection[]): string;
/**
 * Update CHANGELOG.md file
 */
export declare function updateChangelogFile(version: string, sections: ChangelogSection[], changelogPath: string, dryRun: boolean): string;
//# sourceMappingURL=changelog.d.ts.map
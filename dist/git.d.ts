/**
 * Git operations wrapper using simple-git
 */
import { ReleaseConfig } from './config.js';
export interface Commit {
    hash: string;
    message: string;
    type?: 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'build' | 'ci';
    scope?: string;
    breaking?: boolean;
    description: string;
    body?: string;
}
export interface TagInfo {
    name: string;
    hash: string;
    version: string;
}
export declare class GitOperations {
    private cwd;
    private git;
    constructor(cwd?: string);
    /**
     * Check if we're in a git repo
     */
    isRepo(): Promise<boolean>;
    /**
     * Get current branch name
     */
    getCurrentBranch(): Promise<string>;
    /**
     * Get last N commits
     */
    getLastCommits(maxCount?: number): Promise<Commit[]>;
    /**
     * Get commits since last tag
     */
    getCommitsSinceLastTag(config: ReleaseConfig): Promise<Commit[]>;
    /**
     * Get all tags sorted by version (newest first)
     */
    getTags(): Promise<TagInfo[]>;
    /**
     * Get latest tag version
     */
    getLatestVersion(config: ReleaseConfig): Promise<string>;
    /**
     * Parse conventional commit message
     */
    private parseCommit;
    /**
     * Create git tag
     */
    createTag(version: string, config: ReleaseConfig): Promise<void>;
    /**
     * Delete last tag (for rollback)
     */
    deleteLastTag(config: ReleaseConfig): Promise<string | null>;
    /**
     * Push tag to remote
     */
    pushTag(version: string, config: ReleaseConfig): Promise<void>;
}
//# sourceMappingURL=git.d.ts.map
/**
 * Git operations wrapper using simple-git
 */
import { simpleGit } from 'simple-git';
export class GitOperations {
    cwd;
    git;
    constructor(cwd = process.cwd()) {
        this.cwd = cwd;
        this.git = simpleGit(this.cwd);
    }
    /**
     * Check if we're in a git repo
     */
    async isRepo() {
        try {
            await this.git.revparse(['--git-dir']);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get current branch name
     */
    async getCurrentBranch() {
        const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
        return branch.trim();
    }
    /**
     * Get last N commits
     */
    async getLastCommits(maxCount = 50) {
        const log = await this.git.log({ maxCount });
        return log.all.map(c => this.parseCommit(c.message));
    }
    /**
     * Get commits since last tag
     */
    async getCommitsSinceLastTag(config) {
        const tags = await this.getTags();
        const lastTag = tags[0];
        if (!lastTag) {
            // No tags yet, get all commits
            return this.getLastCommits(100);
        }
        if (!lastTag.hash) {
            // Tag hash not available, get all commits
            return this.getLastCommits(100);
        }
        // Use git log range syntax via simple-git
        const log = await this.git.log([`${lastTag.hash}..HEAD`]);
        return log.all.map(c => this.parseCommit(c.message));
    }
    /**
     * Get all tags sorted by version (newest first)
     */
    async getTags() {
        const tags = await this.git.tags();
        const tagData = await this.git.tag(['-l', '--format=%(refname:short)%00%(objectname)']);
        // Parse tag data to get hashes
        const tagMap = new Map();
        for (const line of tagData.split('\n')) {
            const [name, hash] = line.split('\0');
            if (name && hash) {
                tagMap.set(name, hash);
            }
        }
        return tags.all
            .filter(t => t.match(/^v?\d+\.\d+\.\d+$/))
            .map(name => ({
            name,
            hash: tagMap.get(name) || '',
            version: name.replace(/^v/, ''),
        }))
            .sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number);
            const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number);
            return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
        });
    }
    /**
     * Get latest tag version
     */
    async getLatestVersion(config) {
        const tags = await this.getTags();
        if (tags.length === 0) {
            return '0.0.0';
        }
        return tags[0].version;
    }
    /**
     * Parse conventional commit message
     */
    parseCommit(message) {
        // Conventional commit regex: type(scope)!: description
        // or type(scope): description
        const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/m;
        const match = message.match(conventionalRegex);
        if (!match) {
            return {
                hash: '',
                message,
                description: message,
            };
        }
        const [, type, scope, breaking, description] = match;
        // Check body for BREAKING CHANGE
        const bodyMatch = message.match(/BREAKING CHANGE:\s*(.+)/im);
        const hasBreakingChange = !!(breaking || bodyMatch);
        return {
            hash: '',
            message,
            type: type,
            scope,
            breaking: hasBreakingChange,
            description,
            body: bodyMatch?.[1],
        };
    }
    /**
     * Create git tag
     */
    async createTag(version, config) {
        const tagName = `${config.tagPrefix}${version}`;
        if (config.dryRun) {
            console.log(`[dry-run] Would create tag: ${tagName}`);
            return;
        }
        await this.git.addAnnotatedTag(tagName, `Release ${version}`);
    }
    /**
     * Delete last tag (for rollback)
     */
    async deleteLastTag(config) {
        const tags = await this.getTags();
        if (tags.length === 0) {
            return null;
        }
        const lastTag = tags[0].name;
        if (config.dryRun) {
            console.log(`[dry-run] Would delete tag: ${lastTag}`);
            return lastTag;
        }
        await this.git.tag(['-d', lastTag]);
        try {
            await this.git.push(['--delete', 'origin', 'refs/tags/' + lastTag]);
        }
        catch {
            // No remote or push failed - tag deleted locally
            console.warn(`Could not delete remote tag ${lastTag} (may not exist on remote)`);
        }
        return lastTag;
    }
    /**
     * Push tag to remote
     */
    async pushTag(version, config) {
        const tagName = `${config.tagPrefix}${version}`;
        if (config.dryRun) {
            console.log(`[dry-run] Would push tag: ${tagName}`);
            return;
        }
        await this.git.push(['--tags']);
    }
}
//# sourceMappingURL=git.js.map
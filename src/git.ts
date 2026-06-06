/**
 * Git operations wrapper using simple-git
 */

import { simpleGit, SimpleGit, LogResult } from 'simple-git';
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

export class GitOperations {
  private git: SimpleGit;

  constructor(private cwd: string = process.cwd()) {
    this.git = simpleGit(this.cwd);
  }

  /**
   * Check if we're in a git repo
   */
  async isRepo(): Promise<boolean> {
    try {
      await this.git.revparse(['--git-dir']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  }

  /**
   * Get last N commits
   */
  async getLastCommits(maxCount: number = 50): Promise<Commit[]> {
    const log: LogResult = await this.git.log({ maxCount });
    return log.all.map(c => this.parseCommit(c.message));
  }

  /**
   * Get commits since last tag
   */
  async getCommitsSinceLastTag(config: ReleaseConfig): Promise<Commit[]> {
    const tags = await this.getTags();
    const lastTag = tags[0];

    if (!lastTag) {
      // No tags yet, get all commits
      return this.getLastCommits(100);
    }

    const log = await this.git.log({ from: lastTag.hash, to: 'HEAD' });
    return log.all.slice(1).map(c => this.parseCommit(c.message)); // skip the tag commit itself
  }

  /**
   * Get all tags sorted by version (newest first)
   */
  async getTags(): Promise<TagInfo[]> {
    const tags = await this.git.tags();
    const tagData = await this.git.tag(['-l', '--format=%(refname:short)%00%(objectname)']);

    // Parse tag data to get hashes
    const tagMap = new Map<string, string>();
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
        hash: tagMap.get(`refs/tags/${name}`) || '',
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
  async getLatestVersion(config: ReleaseConfig): Promise<string> {
    const tags = await this.getTags();
    if (tags.length === 0) {
      return '0.0.0';
    }
    return tags[0].version;
  }

  /**
   * Parse conventional commit message
   */
  private parseCommit(message: string): Commit {
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
      type: type as Commit['type'],
      scope,
      breaking: hasBreakingChange,
      description,
      body: bodyMatch?.[1],
    };
  }

  /**
   * Create git tag
   */
  async createTag(version: string, config: ReleaseConfig): Promise<void> {
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
  async deleteLastTag(config: ReleaseConfig): Promise<string | null> {
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
    } catch {
      // No remote or push failed - tag deleted locally
      console.warn(`Could not delete remote tag ${lastTag} (may not exist on remote)`);
    }
    return lastTag;
  }

  /**
   * Push tag to remote
   */
  async pushTag(version: string, config: ReleaseConfig): Promise<void> {
    const tagName = `${config.tagPrefix}${version}`;
    if (config.dryRun) {
      console.log(`[dry-run] Would push tag: ${tagName}`);
      return;
    }
    await this.git.push(['--tags']);
  }
}

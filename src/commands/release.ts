/**
 * Main release command - auto-detect version bump from conventional commits
 */

import chalk from 'chalk';
import { join } from 'path';
import { GitOperations, type Commit } from '../git.js';
import { loadConfig, type ReleaseConfig } from '../config.js';
import {
  detectVersionBump,
  bumpVersion,
  groupCommits,
  updateChangelogFile,
} from '../changelog.js';
import { createGitHubRelease } from '../github.js';
import { publishToNpm, updatePackageVersion } from '../npm.js';

export interface ReleaseOptions {
  dryRun?: boolean;
  skipNpm?: boolean;
  skipGit?: boolean;
}

/**
 * Main release flow
 */
export async function release(options: ReleaseOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 ReleaseFlow - Zero-Config Release Automation\n'));

  // Load config
  let config = loadConfig();
  if (options.dryRun) {
    config = { ...config, dryRun: true };
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  // Initialize git
  const git = new GitOperations();

  // Check if we're in a git repo
  if (!(await git.isRepo())) {
    console.error(chalk.red('❌ Not a git repository'));
    process.exit(1);
  }

  // Get current version
  const currentVersion = await git.getLatestVersion(config);
  console.log(chalk.gray(`Current version: ${currentVersion}`));

  // Get commits since last tag
  console.log(chalk.gray('Analyzing commits...'));
  const commits = await git.getCommitsSinceLastTag(config);

  if (commits.length === 0) {
    console.log(chalk.yellow('⚠️  No new commits since last release'));
    process.exit(0);
  }

  console.log(chalk.gray(`Found ${commits.length} commit(s)`));

  // Detect version bump
  const bumpType = detectVersionBump(commits);
  console.log(chalk.gray(`Detected bump type: ${bumpType}`));

  if (bumpType === 'none') {
    console.log(chalk.yellow('⚠️  No version bump detected (no feat/fix/BREAKING commits)'));
    console.log(chalk.gray('Tip: Use explicit bump commands: releaseflow patch|minor|major'));
    process.exit(0);
  }

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType);
  console.log(chalk.green.bold(`✨ New version: ${newVersion}\n`));

  // Group commits for changelog
  const sections = groupCommits(commits);

  // Show preview
  console.log(chalk.bold('📋 Changelog preview:'));
  for (const section of sections) {
    console.log(chalk.cyan(section.title));
    for (const commit of section.commits) {
      console.log(`  ${chalk.gray('-')} ${commit}`);
    }
  }
  console.log('');

  // Execute release steps
  if (!options.skipGit) {
    // Update package.json version
    await updatePackageVersion(newVersion, config);
    console.log(chalk.green(`✓ Updated package.json to ${newVersion}`));

    // Update changelog
    const changelogPath = join(process.cwd(), config.changelogFile);
    const changelog = updateChangelogFile(newVersion, sections, changelogPath, config.dryRun);
    console.log(chalk.green(`✓ Updated ${config.changelogFile}`));

    // Create git tag
    await git.createTag(newVersion, config);
    console.log(chalk.green(`✓ Created git tag ${config.tagPrefix}${newVersion}`));

    // Push tag
    await git.pushTag(newVersion, config);
    console.log(chalk.green(`✓ Pushed tag to origin`));

    // Create GitHub release
    await createGitHubRelease(newVersion, changelog, config);
    console.log(chalk.green(`✓ Created GitHub release`));
  }

  if (!options.skipNpm) {
    // Publish to npm
    await publishToNpm(config);
    console.log(chalk.green(`✓ Published to npm`));
  }

  console.log(chalk.green.bold(`\n✨ Release ${newVersion} complete!\n`));

  if (config.dryRun) {
    console.log(chalk.yellow('This was a dry run. Re-run without --dry-run to execute.'));
  }
}

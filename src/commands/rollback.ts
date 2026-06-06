/**
 * Rollback - delete last git tag and GitHub release
 */

import chalk from 'chalk';
import { GitOperations } from '../git.js';
import { loadConfig, withDryRun } from '../config.js';
import { deleteLastGitHubRelease } from '../github.js';

export interface RollbackOptions {
  dryRun?: boolean;
}

/**
 * Rollback last release
 */
export async function rollback(options: RollbackOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('\n⏪ ReleaseFlow - Rollback Last Release\n'));

  // Load config
  let config = loadConfig();
  if (options.dryRun) {
    config = withDryRun(config, true);
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  // Initialize git
  const git = new GitOperations();

  // Check if we're in a git repo
  if (!(await git.isRepo())) {
    console.error(chalk.red('❌ Not a git repository'));
    process.exit(1);
  }

  // Get latest tag
  const tags = await git.getTags();
  if (tags.length === 0) {
    console.log(chalk.yellow('⚠️  No tags found. Nothing to rollback.'));
    process.exit(0);
  }

  const lastTag = tags[0];
  console.log(chalk.gray(`Last tag: ${lastTag.name} (${lastTag.version})`));
  console.log('');

  // Confirm rollback
  if (!config.dryRun) {
    console.log(chalk.yellow('⚠️  This will:'));
    console.log(chalk.yellow(`  - Delete git tag ${lastTag.name}`));
    console.log(chalk.yellow(`  - Delete GitHub release ${lastTag.name}`));
    console.log(chalk.yellow('  - Leave npm package unchanged (manual npm unpublish required)\n'));

    // In non-interactive mode, we proceed. For interactive, we'd prompt here.
    console.log(chalk.gray('Proceeding with rollback...\n'));
  }

  // Delete GitHub release
  const releaseDeleted = await deleteLastGitHubRelease(lastTag.version, config);
  if (releaseDeleted) {
    console.log(chalk.green(`✓ Deleted GitHub release ${lastTag.name}`));
  } else if (!config.dryRun) {
    console.log(chalk.yellow(`⚠️  GitHub release ${lastTag.name} might not exist`));
  }

  // Delete git tag
  const deletedTag = await git.deleteLastTag(config);
  if (deletedTag) {
    console.log(chalk.green(`✓ Deleted git tag ${deletedTag}`));
  }

  // NPM instructions
  console.log('');
  console.log(chalk.bold('ℹ️  To unpublish from npm:'));
  console.log(chalk.gray(`  npm unpublish releaseflow@${lastTag.version}`));
  console.log(chalk.gray('  Note: npm unpublish is only allowed within 72 hours of publish\n'));

  if (config.dryRun) {
    console.log(chalk.yellow('This was a dry run. Re-run without --dry-run to execute.'));
  }
}

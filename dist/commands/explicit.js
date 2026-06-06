/**
 * Explicit version bump commands (patch, minor, major)
 */
import chalk from 'chalk';
import { join } from 'path';
import { GitOperations } from '../git.js';
import { loadConfig, withDryRun } from '../config.js';
import { bumpVersion, groupCommits, updateChangelogFile, } from '../changelog.js';
import { createGitHubRelease } from '../github.js';
import { publishToNpm, updatePackageVersion } from '../npm.js';
/**
 * Release with explicit version bump type
 */
export async function explicitRelease(bumpType, options = {}) {
    console.log(chalk.cyan.bold(`\n🚀 ReleaseFlow - ${bumpType.toUpperCase()} Release\n`));
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
    // Get current version
    const currentVersion = await git.getLatestVersion(config);
    console.log(chalk.gray(`Current version: ${currentVersion}`));
    // Calculate new version
    const newVersion = bumpVersion(currentVersion, bumpType);
    console.log(chalk.green.bold(`✨ New version: ${newVersion}\n`));
    // Get commits since last tag for changelog
    console.log(chalk.gray('Analyzing commits...'));
    const commits = await git.getCommitsSinceLastTag(config);
    if (commits.length === 0) {
        console.log(chalk.yellow('⚠️  No new commits since last release'));
    }
    else {
        console.log(chalk.gray(`Found ${commits.length} commit(s)`));
    }
    // Group commits for changelog
    const sections = groupCommits(commits);
    // Show preview
    if (sections.length > 0) {
        console.log(chalk.bold('📋 Changelog preview:'));
        for (const section of sections) {
            console.log(chalk.cyan(section.title));
            for (const commit of section.commits) {
                console.log(`  ${chalk.gray('-')} ${commit}`);
            }
        }
        console.log('');
    }
    else {
        console.log(chalk.yellow('No conventional commits found for changelog\n'));
    }
    // === File operations (always execute, even with --skip-git) ===
    // Update package.json version
    await updatePackageVersion(newVersion, config);
    console.log(chalk.green(`✓ Updated package.json to ${newVersion}`));
    // Update changelog
    const changelogPath = join(process.cwd(), config.changelogFile);
    const changelog = updateChangelogFile(newVersion, sections, changelogPath, config.dryRun);
    console.log(chalk.green(`✓ Updated ${config.changelogFile}`));
    // === Git operations (skip with --skip-git) ===
    if (!options.skipGit) {
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
    else {
        console.log(chalk.yellow('⚠️  Skipped git operations (tag, push, GitHub release)'));
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
//# sourceMappingURL=explicit.js.map
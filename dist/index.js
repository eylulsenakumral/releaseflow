#!/usr/bin/env node
/**
 * ReleaseFlow CLI - Zero-config release automation for JavaScript packages
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { release } from './commands/release.js';
import { explicitRelease } from './commands/explicit.js';
import { rollback } from './commands/rollback.js';
const program = new Command();
// CLI metadata
program
    .name('releaseflow')
    .description('Zero-config release automation CLI for JavaScript packages')
    .version('0.1.0');
// Global options
program.option('--dry-run', 'Show what would happen without making changes');
// Main release command (auto-detect version bump)
program
    .argument('[bumpType]', 'Explicit version bump type: patch, minor, or major')
    .option('--skip-npm', 'Skip publishing to npm')
    .option('--skip-git', 'Skip git operations')
    .action(async (bumpType, options) => {
    try {
        if (!bumpType) {
            // Auto-detect from conventional commits
            await release(options);
        }
        else if (['patch', 'minor', 'major'].includes(bumpType)) {
            // Explicit bump
            await explicitRelease(bumpType, options);
        }
        else {
            console.error(chalk.red(`Invalid bump type: ${bumpType}`));
            console.error(chalk.gray('Use: patch, minor, or major'));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        if (options.dryRun) {
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
});
// Rollback command
program
    .command('rollback')
    .description('Delete last git tag and GitHub release')
    .option('--dry-run', 'Show what would happen without making changes')
    .action(async (options) => {
    try {
        await rollback(options);
    }
    catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        if (options.dryRun) {
            console.error(chalk.gray(error.stack));
        }
        process.exit(1);
    }
});
// Parse and execute
program.parseAsync(process.argv).catch((error) => {
    console.error(chalk.red(`Unexpected error: ${error.message}`));
    process.exit(1);
});
//# sourceMappingURL=index.js.map
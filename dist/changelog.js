/**
 * Changelog generator for conventional commits
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
/**
 * Detect version bump type from commits
 */
export function detectVersionBump(commits) {
    let hasBreaking = false;
    let hasFeat = false;
    let hasFix = false;
    for (const commit of commits) {
        if (commit.breaking) {
            hasBreaking = true;
        }
        if (commit.type === 'feat') {
            hasFeat = true;
        }
        if (commit.type === 'fix') {
            hasFix = true;
        }
    }
    if (hasBreaking)
        return 'major';
    if (hasFeat)
        return 'minor';
    if (hasFix)
        return 'patch';
    return 'none';
}
/**
 * Bump version based on type
 */
export function bumpVersion(current, type) {
    const [major, minor, patch] = current.split('.').map(Number);
    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
    }
}
/**
 * Group commits by type for changelog
 */
export function groupCommits(commits) {
    const sections = new Map([
        ['feat', { type: 'feat', title: '### Added', commits: [] }],
        ['fix', { type: 'fix', title: '### Fixed', commits: [] }],
        ['breaking', { type: 'breaking', title: '### Breaking', commits: [] }],
        ['other', { type: 'other', title: '### Other', commits: [] }],
    ]);
    for (const commit of commits) {
        let section;
        if (commit.breaking) {
            section = sections.get('breaking');
            section.commits.push(commit.scope ? `**${commit.scope}**: ${commit.description}` : commit.description);
        }
        else if (commit.type === 'feat') {
            section = sections.get('feat');
            section.commits.push(commit.scope ? `**${commit.scope}**: ${commit.description}` : commit.description);
        }
        else if (commit.type === 'fix') {
            section = sections.get('fix');
            section.commits.push(commit.scope ? `**${commit.scope}**: ${commit.description}` : commit.description);
        }
        else if (commit.type) {
            section = sections.get('other');
            section.commits.push(`${commit.type}${commit.scope ? `(${commit.scope})` : ''}: ${commit.description}`);
        }
    }
    return Array.from(sections.values()).filter(s => s.commits.length > 0);
}
/**
 * Generate changelog markdown
 */
export function generateChangelog(version, sections) {
    const date = new Date().toISOString().split('T')[0];
    let md = `## [${version}] - ${date}\n\n`;
    for (const section of sections) {
        md += `${section.title}\n`;
        for (const commit of section.commits) {
            md += `- ${commit}\n`;
        }
        md += '\n';
    }
    return md.trim();
}
/**
 * Update CHANGELOG.md file
 */
export function updateChangelogFile(version, sections, changelogPath, dryRun) {
    const newEntry = generateChangelog(version, sections);
    if (!existsSync(changelogPath)) {
        // Create new changelog
        const content = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newEntry}\n`;
        if (dryRun) {
            console.log(`[dry-run] Would create changelog:\n${content}`);
            return newEntry;
        }
        writeFileSync(changelogPath, content, 'utf-8');
        return newEntry;
    }
    // Read existing and prepend new entry
    const existing = readFileSync(changelogPath, 'utf-8');
    const lines = existing.split('\n');
    // Find the first version header (## [) and insert before it
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^## \[/)) {
            insertIndex = i;
            break;
        }
    }
    const updated = [
        ...lines.slice(0, insertIndex),
        newEntry,
        '',
        ...lines.slice(insertIndex),
    ].join('\n');
    if (dryRun) {
        console.log(`[dry-run] Would update changelog with:\n${newEntry}`);
        return newEntry;
    }
    writeFileSync(changelogPath, updated, 'utf-8');
    return newEntry;
}
//# sourceMappingURL=changelog.js.map
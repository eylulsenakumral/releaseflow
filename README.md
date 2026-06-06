# ReleaseFlow CLI

> Zero-config release automation for JavaScript packages - Ship in 5 seconds without touching `package.json`

## Why ReleaseFlow?

Existing release tools are complex:

- **semantic-release**: 20+ plugins, config hell
- **release-it**: Plugin confusion, steep learning curve
- **standard-version**: Deprecated, unmaintained

ReleaseFlow is different:

- **Zero config** - Works out of the box for 90% of repos
- **Conventional commits** - Detect version bump from commit messages
- **Simple** - One command, no plugins needed
- **Fast** - 5 seconds from `git push` to npm publish

## Quick Start

```bash
# Clone and install
git clone https://github.com/eylulsenakumral/releaseflow.git
cd releaseflow
npm install

# Run
npx releaseflow
```

## How It Works

ReleaseFlow reads your commit messages to detect version bumps:

| Commit Type | Version Bump |
|------------|--------------|
| `fix:` ... | patch (1.0.0 → 1.0.1) |
| `feat:` ... | minor (1.0.0 → 1.1.0) |
| `feat!: ...` or `BREAKING CHANGE:` | major (1.0.0 → 2.0.0) |

## Commands

### `releaseflow` (Auto-detect)

Analyzes commits since last tag and auto-detects version bump:

```bash
npx releaseflow
```

**Output:**
```
🚀 ReleaseFlow - Zero-Config Release Automation

Current version: 1.0.0
Found 5 commit(s)
Detected bump type: minor
✨ New version: 1.1.0

📋 Changelog preview:
### Added
- feat: add user authentication
- feat(auth): add OAuth2 support

✓ Updated package.json to 1.1.0
✓ Updated CHANGELOG.md
✓ Created git tag v1.1.0
✓ Pushed tag to origin
✓ Created GitHub release
✓ Published to npm

✨ Release 1.1.0 complete!
```

### `releaseflow patch|minor|major` (Explicit)

Force a specific version bump type:

```bash
npx releaseflow patch    # 1.0.0 → 1.0.1
npx releaseflow minor    # 1.0.0 → 1.1.0
npx releaseflow major    # 1.0.0 → 2.0.0
```

### `releaseflow rollback` (Undo)

Delete last tag and GitHub release:

```bash
npx releaseflow rollback
```

**Note:** npm unpublish must be done manually (72-hour limit).

### `--dry-run` (Preview)

See what would happen without executing:

```bash
npx releaseflow --dry-run
npx releaseflow patch --dry-run
npx releaseflow rollback --dry-run
```

### `--skip-npm` / `--skip-git`

Skip specific operations:

```bash
npx releaseflow --skip-npm       # Skip npm publish
npx releaseflow --skip-git       # Skip git operations
```

## Configuration

ReleaseFlow works with zero config, but you can customize via `.releaserc.json`:

```json
{
  "mainBranch": "master",
  "tagPrefix": "v",
  "changelogFile": "CHANGELOG.md"
}
```

## Conventional Commits

ReleaseFollows the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New feature (minor bump)
- `fix:` - Bug fix (patch bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (major bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - Other (no bump unless `!`)

**Examples:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix(api): handle null response"
git commit -m "feat!: change authentication flow"
git commit -m "docs: update README"
```

## Changelog

ReleaseFlow generates `CHANGELOG.md` automatically:

```markdown
## [1.1.0] - 2025-01-15

### Added
- feat: add user authentication
- feat(auth): add OAuth2 support

### Fixed
- fix(api): handle null response

### Breaking
- **auth**: change authentication flow
```

## GitHub Releases

ReleaseFlow creates GitHub releases automatically with:

- Version tag (e.g., `v1.1.0`)
- Changelog as release notes
- Link to commits

**Requires:** `gh` CLI authenticated with GitHub.

```bash
# Authenticate gh CLI
gh auth login
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npx releaseflow
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## FAQ

### How does it detect version bump?

Scans commits since last tag for conventional commit types.

### Can I force a specific version?

Use explicit commands: `releaseflow patch|minor|major`

### Does it work with monorepos?

Yes, run in each package directory independently.

### Can I skip npm publish?

Use `--skip-npm` flag.

### What if gh CLI isn't installed?

Git tags still work; GitHub release is silently skipped with warning.

## License

MIT

## Author

ReleaseFlow CLI - Making JavaScript releases painless since 2025

---

**Ship faster. Configure less.** 🚀

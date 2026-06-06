# ReleaseFlow Distribution Strategy

## Overview
ReleaseFlow is distributed primarily via the public npm registry.

## Distribution Channels

### 1. Primary: npm Registry
- **Package**: `releaseflow`
- **Install**: `npm install -g releaseflow` or `npx releaseflow`
- **Registry**: https://www.npmjs.com/package/releaseflow
- **No authentication required** for public installs

### 2. Secondary: GitHub Releases
- Auto-generated releases via `.github/workflows/publish.yml`
- Source code attachments (.tgz)
- Version history and changelog

### 3. Tertiary: Direct from git (for contributors)
```bash
git clone https://github.com/eylulsenakumral/releaseflow
cd releaseflow
npm install -g .
```

## Publishing Process

### Initial Setup (one-time)
1. Create npm account at https://npmjs.com
2. Create npm token: Account → Access Tokens → Automation
3. Add token to GitHub repo secrets as `NPM_TOKEN`
4. Optionally copy `.npmrc.example` to `.npmrc` and enable provenance

### Publishing a New Release
```bash
# Option 1: Use GitHub (recommended)
# Create a GitHub release → workflow auto-publishes to npm

# Option 2: Manual npm publish
npm run prepublish:check  # Run checklist
npm publish               # Publish to npm
```

### Version Bump Process
```bash
# Make your changes
git commit -am "feat: add new feature"

# ReleaseFlow handles the rest
npx releaseflow patch    # 0.1.0 → 0.1.1
npx releaseflow minor   # 0.1.0 → 0.2.0
npx releaseflow major   # 0.1.0 → 1.0.0

# Or auto-detect from commits
npx releaseflow
```

## CI/CD Pipeline
`.github/workflows/publish.yml` triggers on:
- GitHub release creation
- Runs: build → test → publish with provenance
- Requires: `NPM_TOKEN` secret in GitHub repo

## Security
- **npm provenance** enabled for package integrity
- **GitHub Actions** with OIDC token (no hardcoded secrets)
- **MIT license** for permissive usage

## Verification After Publish
```bash
# Check package on npm
npm view releaseflow

# Test install
npx releaseflow@latest --help

# Check provenance (requires npm >=9.8.0)
npm view releaseflow --json | jq '.versions,.dist'
```

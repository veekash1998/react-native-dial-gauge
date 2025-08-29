# Publishing Guide for react-native-dial-gauge

This guide will walk you through publishing your React Native dial gauge component to npm.

## Prerequisites

1. **Node.js and npm installed** (version 14 or higher)
2. **npm account** - Create one at [npmjs.com](https://www.npmjs.com/)
3. **Git repository** (optional but recommended)

## Step-by-Step Publishing Process

### 1. Prepare Your Package

First, make sure you're in the package directory:
```bash
cd react-native-dial-gauge
```

### 2. Update package.json

Edit the `package.json` file and update these fields with your information:

```json
{
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/react-native-dial-gauge.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/react-native-dial-gauge/issues"
  },
  "homepage": "https://github.com/yourusername/react-native-dial-gauge#readme"
}
```

### 3. Test Your Package Locally

Before publishing, test your package:

```bash
# Install dependencies (if any)
npm install

# Test the package structure
npm pack
```

This creates a `.tgz` file that shows exactly what will be published.

### 4. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 5. Check Package Name Availability

```bash
npm view react-native-dial-gauge
```

If you get an error, the name is available. If not, you'll need to choose a different name.

### 6. Publish Your Package

For the first publication:

```bash
npm publish
```

If the name is taken, you can publish with a scoped name:

```bash
npm publish --access public
```

Or change the name in package.json to something like:
- `@yourusername/react-native-dial-gauge`
- `react-native-dial-gauge-custom`
- `rn-circular-dial-gauge`

### 7. Verify Publication

Check your package on npm:
```bash
npm view react-native-dial-gauge
```

Or visit: `https://www.npmjs.com/package/react-native-dial-gauge`

## Updating Your Package

When you make improvements:

### 1. Update Version Number

Use semantic versioning:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 2. Publish Update

```bash
npm publish
```

## Best Practices

### Before Publishing

1. **Test thoroughly** - Test on different devices and React Native versions
2. **Update README** - Ensure examples work and documentation is clear
3. **Add keywords** - Help users find your package
4. **Check file size** - Use `npm pack` to see what's included

### Version Management

- **Patch (1.0.x)**: Bug fixes, small improvements
- **Minor (1.x.0)**: New features, backward compatible
- **Major (x.0.0)**: Breaking changes

### Documentation

- Keep README updated with latest features
- Include working examples
- Document all props and their types
- Add troubleshooting section

## Common Issues and Solutions

### 1. Package Name Already Taken

**Solution**: Use a scoped package name or choose a different name:
```json
{
  "name": "@yourusername/react-native-dial-gauge"
}
```

Then publish with:
```bash
npm publish --access public
```

### 2. Permission Denied

**Solution**: Make sure you're logged in and have permission:
```bash
npm whoami
npm login
```

### 3. Files Not Included

**Solution**: Check your `.npmignore` and `files` field in package.json:
```json
{
  "files": [
    "index.js",
    "index.d.ts",
    "README.md",
    "LICENSE"
  ]
}
```

### 4. Large Package Size

**Solution**: 
- Add unnecessary files to `.npmignore`
- Remove dev dependencies from dependencies
- Use `npm pack` to check contents

## Promoting Your Package

1. **GitHub Repository**: Create a repo with examples and documentation
2. **Social Media**: Share on Twitter, LinkedIn, dev communities
3. **React Native Communities**: Share in Discord, Reddit, forums
4. **Blog Post**: Write about your component and its use cases
5. **Add to Lists**: Submit to awesome-react-native lists

## Maintenance

- **Monitor Issues**: Respond to GitHub issues and npm feedback
- **Keep Dependencies Updated**: Regular security updates
- **Test with New RN Versions**: Ensure compatibility
- **Community Feedback**: Listen to user suggestions

## Example Commands Summary

```bash
# Initial setup
cd react-native-dial-gauge
npm login

# Check if name is available
npm view react-native-dial-gauge

# First publish
npm publish

# Update versions
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Publish updates
npm publish

# Check published package
npm view react-native-dial-gauge
```

## Success! 🎉

Once published, users can install your package with:

```bash
npm install react-native-dial-gauge
```

Your package will be available at:
- npm: `https://www.npmjs.com/package/react-native-dial-gauge`
- CDN: `https://unpkg.com/react-native-dial-gauge/`

Remember to keep your package updated and respond to community feedback!
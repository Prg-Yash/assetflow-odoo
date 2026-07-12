const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Handle packages with broken package.json exports/main fields (e.g. react-native-worklets pointing to src/index)
const fs = require('fs');
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-worklets') {
    try {
      const workletsPath = path.resolve(workspaceRoot, 'node_modules/react-native-worklets/lib/module/index.js');
      if (fs.existsSync(workletsPath)) {
        return {
          filePath: workletsPath,
          type: 'sourceFile',
        };
      }
    } catch (e) {
      // Fallback to normal resolution
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(config, { input: './src/global.css' });

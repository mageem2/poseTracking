// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

//adding bin files for assets for tensorflow models to be loaded at compile-time
defaultConfig.resolver.assetExts.push('bin');

module.exports = defaultConfig;
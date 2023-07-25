// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

defaultConfig.resolver.assetExts.push("css");

module.exports = defaultConfig;

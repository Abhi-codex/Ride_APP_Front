const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable better web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

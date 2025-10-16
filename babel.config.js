module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // IMPORTANT: keep the Reanimated plugin LAST
    plugins: ['react-native-reanimated/plugin'],
  };
};

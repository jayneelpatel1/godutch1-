// https://docs.expo.dev/guides/using-eslint/
const coreConfig = require("eslint-config-expo/utils/core.js");
const typescriptConfig = require("eslint-config-expo/utils/typescript.js");
const reactConfig = require("eslint-config-expo/utils/react.js");
const expoConfig = require("eslint-config-expo/utils/expo.js");

module.exports = [
  coreConfig,
  typescriptConfig,
  reactConfig,
  expoConfig,
  {
    ignores: ["dist/*"],
    settings: require("eslint-config-expo").settings,
    overrides: require("eslint-config-expo").overrides,
  }
];
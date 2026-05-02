// https://docs.expo.dev/guides/using-eslint/
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const expoConfigs = compat.extends('expo');

module.exports = [
  ...expoConfigs,
  {
    ignores: ['dist/*', 'src/components/app-tabs.web.tsx', 'src/components/ui/collapsible.tsx'],
  },
];

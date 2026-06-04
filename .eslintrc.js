module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: ['next/core-web-vitals'],
  rules: {
    // Allow use of globalThis in server and modern environments
    'no-undef': 'off',
  },
}

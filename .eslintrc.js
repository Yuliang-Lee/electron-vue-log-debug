module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'comma-dangle': ['error', 'only-multiline'],
    'prefer-promise-reject-errors': 0,
    'space-before-function-paren': ['error', 'never'],
    'standard/no-callback-literal': 0,
    'one-var': 0,
    'no-unused-vars': 1,
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
        normal: 'always',
        component: 'never'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/attributes-order': 0,
    'vue/max-attributes-per-line': [2, {
      singleline: 4,
      multiline: {
        max: 1,
        allowFirstLine: false
      }
    }],
    'vue/require-default-prop': 0,
    'vue/no-unused-vars': 1,
    'vue/html-closing-bracket-newline': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 1,
    'import/no-webpack-loader-syntax': 0
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
}

// const fs = require('fs')
const path = require('path')

module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: {
            loader: 'worker-loader',
            options: { inline: true }
          },
        }
      ]
    }
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/variables.scss'),
      ]
    }
  }
}

const FileManagerPlugin = require('filemanager-webpack-plugin');
const buildTarget = process.argv.slice().reverse()[3];

module.exports = {
  publicPath: './',
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    if (buildTarget === 'lib') {
      config.externals = ['zego-zim-web'];
      return {
        plugins: [
          new FileManagerPlugin({
            events: {
              onEnd: {
                copy: [
                  { source: 'dist/zimkit.umd.min.js', destination: 'dist/index.js' },
                  { source: 'dist/zimkit.css', destination: 'dist/index.css' },
                  { source: 'dist/zimkit.umd.min.js', destination: 'npm/index.js' },
                  { source: 'dist/zimkit.css', destination: 'npm/index.css' }
                ],
                delete: ['dist/demo.html', 'dist/zimkit.umd.js', 'dist/zimkit.umd.min.js', 'dist/zimkit.common.js', 'dist/zimkit.css'],
              },
            },
          }),
        ]
      }
    }
  },
  chainWebpack: (config) => {
    if (buildTarget === 'lib') {
      config.module
        .rule('images')
        .use('url-loader')
        .loader('url-loader')
        .tap((options) => Object.assign(options, { limit: 14 * 1024 }));
    }
  },
  productionSourceMap: false,
};

module.exports = {
    publicPath: '',
    chainWebpack: config => {
      config.module
        .rule('shader')
          .test(/\.(glsl|vert|frag)$/)
          .use('ts-shader-loader')
          .loader('ts-shader-loader')
          .end()
        .rule('file')
          .test(/\.(png|jpe?g|gif|jp2|webp)$/)
          .use('file-loader')
          .loader('file-loader')
          .end()
    },
    css: {
      extract: false
    },
  }
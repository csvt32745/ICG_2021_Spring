module.exports = {
    publicPath: '',
    chainWebpack: config => {
      config.module
        .rule('shader')
        .test(/\.(glsl|vert|frag)$/)
        .use('ts-shader-loader')
        .loader('ts-shader-loader')
        .end()
    },
  }
module.exports = {
    entry: './main.ts',
    output: {
      filename: 'bundle.js',
      path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    'babel-loader',
                    'awesome-typescript-loader'
                ]
            },
            {
                test: /\.(glsl|vert|frag)$/,
                loader: 'ts-shader-loader'
            }
        ]
    }
}
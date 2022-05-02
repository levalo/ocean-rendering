const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(glsl|obj|frag|vert)$/,
                use: [
                    require.resolve('raw-loader')
                ],
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,  
                use: 'url-loader'
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'build'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 8080,
        open: {
            app: {
                name: 'firefox',
            }
        }
    }
};
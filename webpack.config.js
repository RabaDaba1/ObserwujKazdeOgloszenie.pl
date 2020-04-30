const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const extractPlugin = new MiniCssExtractPlugin({
    filename: 'css/framework/main.css',
});

const srcDir = path.resolve(__dirname, "client/src");
const distDir = path.resolve(__dirname, 'client/dist'); 

module.exports = [
    /**
     * JavaScript & Images
     */
    {
        context: srcDir,
        entry: {
            show: './js/offers/show.js',
        },
        output: {
            path: distDir,
            filename: 'js/[name].bundle.js',
            publicPath: '/'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'babel-loader'
                    }]
                },
                {
                    test: /\.ejs$/,
                    use: ['html-loader']
                },
                {
                    test: /\.(jpg|png)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/'
                        }
                    }]
                }
            ]
        },
        plugins: [
            // new CleanWebpackPlugin()
        ]
    },
    /**
     * FRAMEWORK
     */
    {
        context: srcDir,
        entry: {
            framework: ['./js/framework/index.js', './css/framework/_main.scss']
        },
        output: {
            path: distDir,
            filename: 'js/framework/[name].bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('node-sass')
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            extractPlugin
        ]
    }
];
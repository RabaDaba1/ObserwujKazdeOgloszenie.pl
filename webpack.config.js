const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const srcDir = path.resolve(__dirname, "client/src");
const distDir = path.resolve(__dirname, 'client/dist'); 

const configs = [
    // OFFERS
    {
        context: srcDir,
        entry: {
            index: [
                './views/offers/index.ejs',
                './public/css/pages/offers/index/_main.scss'
            ],
            new: [
                './views/offers/new.ejs',
                './public/css/pages/offers/new/_main.scss'
            ],
            show: [
                './views/offers/show.ejs',
                './public/js/pages/offers/show/index.js',
                './public/css/pages/offers/show/_main.scss'
            ]
        },
        output: {
            path: distDir,
            filename: 'public/js/pages/[name].[chunkhash].bundle.js',
            publicPath: '../public/js/offers/'
        },
        module: {
            rules: []
        },
        plugins: [new CleanWebpackPlugin()]
    },
    // FRAMEWORK
    {
        context: srcDir,
        entry: {
            framework: ['./public/js/framework/index.js', './public/css/framework/_main.scss']
        },
        output: {
            path: distDir,
            filename: 'public/js/framework/[name].bundle.js'
        },
        module: {
            rules: []
        },
        plugins: [

        ]
    }
];

const babelLoader = {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader'
    }
};

const scssLoader = {
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
};

const fileLoader = {
    test: /\.(jpg|png)$/,
    use: [{
        loader: 'file-loader',
        options: {
            name: '[name].[ext]',
            outputPath: 'img/',
            publicPath: 'img/'
        }
    }]
};

const ejsLoader = {
    test: /\.ejs$/,
    use: ['html-loader']
};

const ejsFileLoader = {
    test: /\.ejs$/,
    use: [{
        loader: 'file-loader',
        options: {
            name: '[name].[ext]',
            outputPath: 'views/',
        }
    }]
}; 

const configOptions = [
    {
        babelLoader: true,
        scssLoader: true,
        fileLoader: true,
        ejsLoader: true,
        ejsFileLoader: true,
        miniCssExtractPlugin: {isUsed: true, fileName: 'public/css/pages/[name].[chunkhash].css' }
    },
    {
        babelLoader: true,
        scssLoader: true,
        miniCssExtractPlugin: { isUsed:true, fileName: 'public/css/framework/main.css' }
    },
];

const pushRule = (loader, configIndex) => configs[configIndex].module.rules.push(loader);
const pushPlugin = (plugin, configIndex) => configs[configIndex].plugins.push(plugin);

configOptions.forEach((el, i) => {
    // Add Babel Loader
    if (el.babelLoader) pushRule(babelLoader, i);

    // Add SCSS Loader
    if (el.scssLoader) pushRule(scssLoader, i);

    // Add File Loader
    if (el.fileLoader) pushRule(fileLoader, i);

    // Add EJS Loader
    if (el.ejsLoader) pushRule(ejsLoader, i);

    // Add EJS File Loader
    if (el.ejsFileLoader) pushRule(ejsFileLoader, i)

    // Add MiniCssExtractPlugin
    if(el.miniCssExtractPlugin.isUsed) pushPlugin(new MiniCssExtractPlugin({filename: el.miniCssExtractPlugin.fileName}), i);
});

module.exports = configs;
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
            index: './public/js/pages/offers/index/index.js',
            new: './public/js/pages/offers/new/index.js',
            show: './public/js/pages/offers/show/index.js'
        },
        output: {
            path: distDir,
            filename: 'public/js/pages/offers/[name].bundle.js',
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
        entry: ['./public/js/framework/index.js', './public/css/framework/_main.scss'],
        output: {
            path: distDir,
            filename: 'public/js/framework/[name].bundle.js'
        },
        module: {
            rules: []
        },
        plugins: []
    },
    // AUTHENTICATION
    {
        context: srcDir,
        entry: './public/js/pages/authentication/index.js',
        output: {
            path: distDir,
            filename: 'public/js/pages/authentication.bundle.js',
        },
        module: {
            rules: []
        },
        plugins: []
    },
    // PARTIALS
    {
        context: srcDir,
        entry: {
            header: './views/partials/header.ejs',
            footer: './views/partials/footer.ejs',
            messages: './views/partials/messages.ejs'
        },
        output: {
            path: distDir,
            // filename: 'public/js/pages/partials/[name]/index.bundle.js',
            // publicPath: '../public/js/partials/'
        },
        module: {
            rules: []
        },
        plugins: [new CleanWebpackPlugin()]
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

const ejsFileLoader = outputPath => {
    return {
        test: /\.ejs$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: `/views/${outputPath}`,
            }
        }]
    }
}; 

const configOptions = [
    // Offers
    {
        babelLoader: true,
        scssLoader: true,
        fileLoader: true,
        ejsLoader: true,
        ejsFileLoader: { isUsed: true, outputPath: 'offers' },
        miniCssExtractPlugin: { isUsed: true, fileName: 'public/css/pages/offers/[name].css' }
    },
    // Framework
    {
        babelLoader: true,
        scssLoader: true,
        ejsFileLoader: { isUsed: false },
        miniCssExtractPlugin: { isUsed: true, fileName: 'public/css/framework/main.css' }
    },
    // Authentication
    {
        babelLoader: true,
        scssLoader: true,
        fileLoader: true,
        ejsLoader: true,
        ejsFileLoader: { isUsed: true, outputPath: 'authentication' },
        miniCssExtractPlugin: { isUsed: false }
    },
    // Partials
    {
        ejsFileLoader: { isUsed: true, outputPath: 'partials' },
        miniCssExtractPlugin: { isUsed: false }
    }
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
    if (el.ejsFileLoader.isUsed) pushRule(ejsFileLoader(el.ejsFileLoader.outputPath), i)

    // Add MiniCssExtractPlugin
    if(el.miniCssExtractPlugin.isUsed) pushPlugin(new MiniCssExtractPlugin({ filename: el.miniCssExtractPlugin.fileName }), i);
});

module.exports = configs;
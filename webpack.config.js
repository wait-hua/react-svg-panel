const prodConfig = require('./build/webpack.prod');
const devConfig = require('./build/webpack.dev');

module.exports = (env = {}) => {
    let config;

    if (env.prod || env.analyzer) {
        config = prodConfig();
    } else {
        config = devConfig();
    }

    return config;
};

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackContentHash = require('webpack-content-hash');
const WebpackOnBuildPlugin = require('on-build-webpack');

module.exports = (env) => {
  let outputPath;
  if (env && env.output) {
    outputPath = env.output;
  } else {
    outputPath = path.join(__dirname, 'public', 'assets');
  }

  return {
    context: path.join(__dirname, 'app', 'assets', 'javascripts'),
    entry: {
      app: [
        path.join(__dirname, 'app', 'assets', 'stylesheets', 'app.js'),
        path.join(__dirname, 'app', 'assets', 'javascripts', 'index.jsx'),
      ],
      vendor: [
        path.join(__dirname, 'app', 'assets', 'stylesheets', 'vendor.js'),
        'dialog-polyfill',
        'domready',
        'excel-column-name',
        'immutable',
        'material-design-lite',
        'react',
        'react-dom',
        'react-redux',
        'redux',
        'redux-immutable',
        'uuid',
      ],
    },

    resolve: {
      extensions: ['.js', '.jsx'],
    },

    plugins: [
      // https://github.com/webpack/webpack/issues/2537
      // comment 222363754
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['app', 'vendor'],
        minChunks: Infinity,
      }),
      new ExtractTextPlugin({
        filename: '[name]-bundle-[contenthash].css',
        allChunks: true,
      }),

      // Copy favicon.
      new CopyWebpackPlugin([
        {
          from: path.join(__dirname, 'app', 'assets', 'images'),
          to: path.join(outputPath, '[name]-[hash].[ext]'),
        },
      ]),

      // Discount sprockets.
      new WebpackOnBuildPlugin((stats) => {
        const buildPath = stats.compilation.outputOptions.path;

        // Files, already existing in buildPath, probably from previous build.
        const existingFiles = fs.readdirSync(buildPath);

        // New files, created by webpack (excluding files added by CopyWebpackPlugin).
        const newFiles = [];
        Object.keys(stats.compilation.assets).forEach((key) => {
          newFiles.push(key);
        });

        // Delete existing files for which there are new ones ready.
        existingFiles.forEach((existingFile) => {
          // filename without '-[hash].[ext]'.
          const normalizeFile = (file) => {
            return file.replace(/-[0-9a-f]{32}.[\s\S]/g, '');
          };

          const normalizedExistingFile = normalizeFile(existingFile);

          const correspondingNewFile = newFiles.find((newFile) => {
            const normalizedNewFile = normalizeFile(newFile);
            return normalizedNewFile === normalizedExistingFile;
          });

          if (correspondingNewFile && correspondingNewFile !== existingFile) {
            fs.unlinkSync(path.join(buildPath, existingFile));
          }
        });

        // Make vendor's bundles to appear upper than app's (for correct load order).
        //   Also place ico over js over css.
        newFiles.sort((a, b) => {
          let result = 1;
          if (a.match(/ico/)) {
            result = -1;
          } else if (b.match(/ico/)) {
            result = 1;
          } else if (a.match(/js/) && !b.match(/js/)) {
            result = -1;
          } else if (!a.match(/js/) && b.match(/js/)) {
            result = 1;
          } else if (a.match(/vendor/) && !b.match(/vendor/)) {
            result = -1;
          }

          return result;
        });

        // Create html tags out of new files.
        let htmlHeadTags = '';
        newFiles.forEach((file) => {
          if (file.match(/.*js$/)) {
            htmlHeadTags += `<script src="/assets/${file}?body=1"></script>\n`;
          } else if (file.match(/.*css$/)) {
            htmlHeadTags += `<link rel="stylesheet" media="all" href="/assets/${file}?body=1">\n`;
          } else if (file.match(/.*ico$/)) {
            htmlHeadTags += `<link rel="shortcut icon" type="image/x-icon" href="/assets/${file}">\n`;
          }
        });

        // Insert html tags into marked place in html layout file.
        const layoutPath = path.join(__dirname, 'app', 'views', 'layouts', 'application.html.erb');
        const layoutTemplatePath = `${layoutPath}.template`;
        const layoutData = fs.readFileSync(layoutTemplatePath, 'utf8');
        const layoutDataModified = layoutData.replace(
          /<%#=\sbegin_webpack_head_tags\s%>[\s\S]*<%#=\send_webpack_head_tags\s%>/m,
          `<%#= begin_webpack_head_tags %>\n${htmlHeadTags}<%#= end_webpack_head_tags %>`
        );
        fs.writeFileSync(layoutPath, layoutDataModified, 'utf8');
      }),
      new WebpackContentHash(),
    ],

    module: {
      rules: [
        {
          test: /\.(js)|(jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'stage-2', 'react'],
          },
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract(['css-loader', 'postcss-loader']),
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader'],
          }),
        },
        {
          // TODO: delete unused *.ttf and other files, since they are compiled into css.
          // TODO: import only used icons (-150 kb).
          test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
          loader: 'url-loader?limit=100000',
        }
      ],
    },

    output: {
      path: outputPath,
      filename: '[name]-bundle-[contenthash].js',
    }
  };
};

export default {
  entry: './src/index.js',
  target: false,
  devtool: false,
  output: {
    filename: 'index.cjs',
    chunkFormat: 'commonjs',
    library: {
      type: 'commonjs',
    },
  },
  module: {
    rules: [
      // Loaders go here.
      // e.g., babel-loader to use Babel for transpiling code
    ],
  },
  resolve: {
    extensions: [],
    conditionNames: [
      'fastly',
      '...',
    ],
  },
  plugins: [
    // Webpack Plugins and Polyfills go here
    // e.g., cross-platform WHATWG or core Node.js modules needed for your application.
    // new webpack.ProvidePlugin({
    // }),
  ],
  externals: [
    // Allow webpack to handle 'fastly:*' namespaced module imports by treating
    // them as modules rather than trying to process them as URLs
    /^fastly:.*$/,
  ],
};

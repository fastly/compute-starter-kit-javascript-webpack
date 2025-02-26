# Compute Starter Kit for JavaScript: Webpack

[![Deploy to Fastly](https://deploy.edgecompute.app/button)](https://deploy.edgecompute.app/fastly/compute-starter-kit-javascript-webpack)

Learn how to use [webpack](https://webpack.js.org/) to bundle modules for the [Fastly Compute JavaScript environment](https://www.fastly.com/documentation/guides/compute/javascript/).

**For more details about other starter kits for Compute, see the [Fastly Documentation Hub](https://www.fastly.com/documentation/solutions/starters)**

## Features

* Contains build steps configured to bundle your application using [webpack](https://webpack.js.org/).
* Provides a starting point for `webpack.config.js` for use with Fastly Compute.

## Understanding the code

Compute applications written in JavaScript that have the [standard structure](https://www.fastly.com/documentation/guides/compute/javascript/#project-layout) and [standard dependencies](https://www.fastly.com/documentation/guides/compute/javascript/#using-dependencies) can be built using the tools included with the JavaScript SDK. However, if your application needs to perform advanced tasks at build time, such as replacing global modules, providing polyfills, or transforming code (such as JSX, TypeScript, or proposed JavaScript syntaxes), you can use a module bundler.

This starter kit demonstrates the use of webpack for bundling, providing a `webpack.config.js` file that can be used as a starting point for configuring your application's specific bundling needs.

Webpack is included in the project as a dependency and run in a `prebuild` script, configured to place its output in an intermediate location. The `build` script then references those intermediate files as its input.

### The `webpack.config.js` file

At minimum, the configuration file should include the following (pre-configured for this project):
* `entry` - The entry point source file, `'./src/index.js'` in this app.
* `target` - Set to `false`, as the [predefined targets provided by webpack do not match](https://webpack.js.org/configuration/target/#false) the Compute platform.
* `devtool` - Set to `false`, as incremental builds do not make sense in the context of Compute.
* `output.filename` - The name of the intermediate file. `'index.cjs'` in this app. See [package type](#package-type) below for details.
* `output.chunkFormat` - Set to `'commonjs'`.
* `output.library.type` - Set to `'commonjs'`. See [package type](#package-type) below for details.
* `externals` - Set to `[ /^fastly:.*$/, ]`. Indicates to webpack that `fastly:` imports should be looked up as external imports rather than modules under `node_modules`.
* `resolve.extensions` - Set to `[]`.
* `resolve.conditionNames` - Set to `['fastly', '...']`.

```javascript
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
  externals: [ /^fastly:.*$/, ],
  resolve: {
    extensions: [],
    conditionNames: [
      'fastly',
      '...',
    ],
  },
};
```

Using these as a starting point, you can further customize the configuration to meet your needs. For example:
- The [`module` section](https://webpack.js.org/configuration/module/) can be used to determine how [different types of modules](https://webpack.js.org/concepts/modules) will be treated.
- [Shimming](https://webpack.js.org/guides/shimming/) and [redirecting module resolution](https://webpack.js.org/configuration/resolve/#resolvefallback) using the [`plugins`](https://webpack.js.org/configuration/plugins/) or [`resolve`](https://webpack.js.org/configuration/resolve/) sections are useful techniques when your code relies on Node.js built-ins, proposals, or newer standards.
- Refer to the [webpack configuration documentation](https://webpack.js.org/configuration/) for more details.

> [!TIP]
> See the Fastly Documentation section on [module bundling for JavaScript](https://www.fastly.com/documentation/guides/compute/javascript/#module-bundling) for further hints.

### The build process

The `package.json` file of this application includes the following scripts:
```json5
{
  "scripts": {
    "prebuild": "webpack",
    "build": "js-compute-runtime dist/index.cjs bin/main.wasm",
    // other scripts
  }
}
```

Building the application through `fastly compute build` (or indirectly by calling `fastly compute serve` or `fastly compute publish`) causes the following steps to run:

1. The `fastly.toml` file is consulted for its `scripts.build` value, resulting in `npm run build`. This instructs npm to execute the `build` script. 
2. Because `package.json` defines a `prebuild` script, npm first runs it: `webpack` runs according to `webpack.config.js`, bundling `src/index.js` and its imports into a single JS file, `dist/index.cjs`.
3. npm runs the `build` script: The `js-compute-runtime` CLI tool (included as part of the `@fastly/js-compute` package) wraps the bundled JS file into a Wasm file at `bin/main.wasm` and packages it into a `.tar.gz` file ready for deployment to Compute.

### Package type

The starter kit's `package.json` file sets [`"type": "module"`](https://nodejs.org/api/packages.html#type). This ensures `.js` source files are loaded as [ES modules](https://nodejs.org/api/esm.html), enabling them to use the modern `import` and `export` syntax to interact with other modules and packages.

However, webpack's output format is the older [CommonJS module](https://nodejs.org/api/modules.html) (*1). During the bundling process, code is transformed to CommonJS syntax (e.g., `import` and `export` are converted to `require()` and `module.exports =`). The starter kit is configured to create the bundled output file with a `.cjs` extension, which indicates that the file is to be treated as a CommonJS module regardless of the `"type"` value of the package.

(*1) - ES module output by webpack is [still experimental](https://webpack.js.org/configuration/experiments/#experimentsoutputmodule) and not fully supported.

### Conditional exports

The starter kit is configured to use the condition name `fastly` when resolving modules ([`resolve.conditionNames`](https://webpack.js.org/configuration/resolve/#resolveconditionnames) of `webpack.config.js`). These are taken into consideration during the bundling process when webpack encounters a package that [defines conditional exports](https://nodejs.org/api/packages.html#conditional-exports).

## Running the application

To create an application using this starter kit, create a new directory for your application and switch to it, and then type the following command:

```shell
npm create @fastly/compute@latest -- --from=https://github.com/fastly/compute-starter-kit-javascript-webpack
```

To build and run your new application in the local development environment, type the following command:

```shell
npm run start
```

To build and deploy your application to your Fastly account, type the following command. The first time you deploy the application, you will be prompted to create a new service in your account. 

```shell
npm run deploy
```

By default, webpack bundles source files in [`'production'` mode](https://webpack.js.org/configuration/mode/). When your bundle is built, the bundle file `dist/index.cjs` will be minified as an optimization. To build in development mode, specify `'development'` mode by setting the `NODE_ENV` environment variable when building the bundle. This can result in a more human-readable bundle, which may help with debugging.

For example:
```shell
NODE_ENV=development npm run start
```

The starter kit doesn't require the use of any backends. Once deployed, you will have a Fastly service running on Compute that can generate synthetic responses at the edge.

## Next steps

Webpack and its community provide a large number of loaders to make various types of files available for loading as modules in your application. These can be mixed and matched, allowing your application to load anything it needs, including [asset (json, png, txt, etc) files](https://webpack.js.org/guides/asset-modules/), [CSS files](https://webpack.js.org/loaders/css-loader), and even [CoffeeScript source files](https://webpack.js.org/loaders/coffee-loader). See [webpack loaders](https://webpack.js.org/loaders/) for a list of loaders.

If you need to load shims or polyfills to make functionality available to your Compute application, take a look at the [Shimming guide](https://webpack.js.org/guides/shimming/) in the webpack documentation.

If you need to redirect or alter rules related to module resolution, take a look at the [Module Resolution guide](https://webpack.js.org/configuration/resolve/) in the webpack documentation.

Webpack has a very large set of configuration options, but is designed in such a way that many of the defaults are sensible, so you only need to make changes that your application needs. Refer to [Configuration concept guide](https://webpack.js.org/concepts/configuration/) and the [Configuration reference](https://webpack.js.org/configuration/) in the webpack documentation for further details.

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

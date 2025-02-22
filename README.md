# Compute Starter Kit for JavaScript: Webpack

[![Deploy to Fastly](https://deploy.edgecompute.app/button)](https://deploy.edgecompute.app/fastly/compute-starter-kit-javascript-webpack)

Learn how to use [webpack](https://webpack.js.org/) to bundle modules for the [Fastly Compute JavaScript environment](https://www.fastly.com/documentation/guides/compute/javascript/).

**For more details about other starter kits for Compute, see the [Fastly Documentation Hub](https://www.fastly.com/documentation/solutions/starters)**

## Features

* Contains build steps configured to bundle your application using [webpack](https://webpack.js.org/).
* Provides a starting point for `webpack.config.js` for use with Fastly Compute

## Understanding the code

Compute applications written in JavaScript can be compiled by the [Fastly CLI](https://www.fastly.com/documentation/reference/tools/cli/) without any bundling, but you can choose to use a module bundler if you want to replace global modules or provide polyfills.

This starter kit demonstrates the use of webpack for bundling, providing a `webpack.config.js` file that can be used as a starting point for configuring your application's specific bundling needs.

For example, you may choose to add rules in the `module` section that determine how different [asset modules](https://webpack.js.org/guides/asset-modules/) will be treated. [Shimming](https://webpack.js.org/guides/shimming/) and [redirecting module requests](https://webpack.js.org/configuration/resolve/#resolvefallback) using the `plugins` or `resolve` sections are useful techniques when your code relies on Node.js built-ins, proposals, or newer standards.

In any case, any Compute project that chooses to use webpack must include the following `externals` code that allows `fastly:` imports to work correctly (pre-configured for this project):
```javascript
module.exports = {

  // ... add your webpack config here ...

  // If your project uses webpack, you MUST include this externals rule to ensure
  // that "fastly:*" namespaced imports work as intended.
  externals: [
    ({request,}, callback) => {
      if (/^fastly:.*$/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ]
};
```

See the documentation section on [module bundling for JavaScript](https://www.fastly.com/documentation/guides/compute/javascript/#module-bundling) for further details.

The `package.json` file of this application includes the following scripts:
```json5
{
  "scripts": {
    "prebuild": "webpack",
    "build": "js-compute-runtime bin/index.js bin/main.wasm",
    // other scripts
  }
}
```

Building the application through `fastly compute build` (or indirectly by calling `fastly compute serve` or `fastly compute publish`) causes the following steps to run:

1. The `fastly.toml` file is consulted for its `scripts.build` value, resulting in `npm run build`. This instructs npm to execute the `build` script. 
2. Because `package.json` defines a `prebuild` script, npm first runs it: `webpack` bundles `src/index.js` and its imports into a single JS file, `bin/index.js`.
3. npm runs the `build` script: The `js-compute-runtime` CLI tool (included as part of the `@fastly/js-compute` package) wraps the bundled JS file into a Wasm file at `bin/main.wasm` and packages it into a `.tar.gz` file ready for deployment to Compute.

The starter kit doesn't require the use of any backends. Once deployed, you will have a Fastly service running on Compute that can generate synthetic responses at the edge.

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

By default, webpack bundles source files in [`'production'` mode](https://webpack.js.org/configuration/mode/). When your bundle is built, the bundle file `bin/index.js` will be minified as an optimization. To build in development mode, specify `'development'` mode by setting the `NODE_ENV` environment variable when building the bundle. This can result in a more human-readable bundle, which may help with debugging.

For example:
```shell
NODE_ENV=development npm run start
```

## Security issues

Please see our [SECURITY.md](SECURITY.md) for guidance on reporting security-related issues.

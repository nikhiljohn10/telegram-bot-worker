const { build } = require("esbuild");
const { devDependencies } = require("./package.json");
const { Generator } = require("npm-dts");

new Generator({
  entry: "src/main.ts",
  output: "out/main.d.ts",
}).generate();

const sharedConfig = {
  sourcemap: true,
  bundle: true,
  external: Object.keys(devDependencies),
};

// npm package
build({
  ...sharedConfig,
  entryPoints: ["src/main.ts"],
  platform: "node",
  outfile: "out/main.js",
});

// worker
build({
  ...sharedConfig,
  entryPoints: ["src/worker.ts"],
  minify: true,
  format: "esm",
  outfile: "dist/worker.mjs",
});

const { build } = require("esbuild");
const { devDependencies } = require("./package.json");
const { Generator } = require("npm-dts");

new Generator({
  entry: "src/main.ts",
  output: "out/main.d.ts",
}).generate();

const sharedConfig = {
  bundle: true,
  minify: true,
  sourcemap: true,
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
  format: "esm",
  outfile: "dist/worker.mjs",
});

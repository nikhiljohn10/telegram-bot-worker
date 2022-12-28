import { build } from "esbuild";
import pack from "./package.json" assert {type: "json"};
import { globPlugin } from "esbuild-plugin-glob";
import dts from "npm-dts";

new dts.Generator({
  entry: "src/main.ts",
  output: "out/main.d.ts",
}).generate();

const sharedConfig = {
  format: "esm",
  sourcemap: true,
  bundle: true,
  external: Object.keys(pack.devDependencies),
  plugins: [globPlugin()],
};

// npm package
build({
  ...sharedConfig,
  entryPoints: ["src/*.ts", "src/*.js"],
  platform: "node",
  outdir: "out",
});

// worker
build({
  ...sharedConfig,
  entryPoints: ["src/worker.ts"],
  minify: true,
  outfile: "dist/worker.mjs",
});

import { build } from "esbuild";
import pack from "./package.json" assert {type: "json"};
import { globPlugin } from "esbuild-plugin-glob";

const sharedConfig = {
  format: "esm",
  sourcemap: true,
  bundle: true,
  external: Object.keys(pack.devDependencies).concat(Object.keys(pack.dependencies)),
  plugins: [globPlugin()],
};

// worker
build({
  ...sharedConfig,
  entryPoints: ["src/worker.ts"],
  minify: true,
  outfile: "dist/worker.mjs",
});

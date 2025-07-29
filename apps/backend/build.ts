import { $ } from "bun";
import { build } from "esbuild";
import type { Plugin, PluginBuild, BuildOptions } from "esbuild";
import fs from "fs";
import path from "path";

const entryPoints = ["./src/**/*.ts"];

const addExtension = (
  extension: string = ".js",
  fileExtension: string = ".ts",
): Plugin => ({
  name: "add-extension",
  setup(build: PluginBuild) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.importer) {
        const p = path.join(args.resolveDir, args.path);
        let tsPath = `${p}${fileExtension}`;

        let importPath = "";
        if (fs.existsSync(tsPath)) {
          importPath = args.path + extension;
        } else {
          tsPath = path.join(
            args.resolveDir,
            args.path,
            `index${fileExtension}`,
          );
          if (fs.existsSync(tsPath)) {
            if (args.path.endsWith("/")) {
              importPath = `${args.path}index${extension}`;
            } else {
              importPath = `${args.path}/index${extension}`;
            }
          }
        }
        return { path: importPath, external: true };
      }
    });
  },
});

const commonOptions: BuildOptions = {
  entryPoints,
  logLevel: "info",
  platform: "node",
};

const cjsBuild = () =>
  build({
    ...commonOptions,
    outbase: "./src",
    outdir: "./dist/cjs",
    format: "cjs",
    minify: true,
  });

const esmBuild = () =>
  build({
    ...commonOptions,
    bundle: true,
    outbase: "./src",
    outdir: "./dist/esm",
    format: "esm",
    minify: true,
    plugins: [addExtension(".js")],
  });

const declarationBuild = async () => {
  await $`tsc --emitDeclarationOnly --declaration --project tsconfig.build.json`.nothrow();
};

Promise.all([esmBuild(), cjsBuild(), declarationBuild()]);

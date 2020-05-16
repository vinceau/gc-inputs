import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "umd",
      name: "gc",
      globals: {
        rxjs: "rxjs",
        "rxjs/operators": "rxjs.operators",
      },
    },
  ],
  external: ["rxjs/operators", ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
  ],
};

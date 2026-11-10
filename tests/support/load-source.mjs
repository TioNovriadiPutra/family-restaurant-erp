import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const modules = new Map();
export function loadSource(filename) {
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  modules.set(filename, mod);
  const nativeRequire = mod.require.bind(mod);
  mod.require = name => name.startsWith("@/")
    ? loadSource(path.join(sourceRoot, "src", name.slice(2)) + ".ts")
    : name.startsWith(".") ? loadSource(path.resolve(path.dirname(filename), name) + ".ts") : nativeRequire(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return mod.exports;
}

import { Plugin } from "rollup";
import { PluginOptions } from "./typing";

export function pluginName(options: PluginOptions): Plugin {
  return {
    name: "pluginName",
  };
}

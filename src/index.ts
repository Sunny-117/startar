import minimist from "minimist";
import { formatTargetDir } from "./utils";

const argv = minimist<{
  template?: string;
  help?: boolean;
}>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: "help", t: "template" },
  string: ["_"],
});

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  console.log(argTargetDir, argTemplate, "-=====-");

  // const help = argv.help;
  // if (help) {
  //   console.log(helpMessage);
  //   return;
  // }

  // let targetDir = argTargetDir || defaultTargetDir;
  // const getProjectName = () =>
  //   targetDir === "." ? path.basename(path.resolve()) : targetDir;

  // let result: prompts.Answers<
  //   "projectName" | "overwrite" | "packageName" | "framework" | "variant"
  // >;
}
init().catch((e) => {
  console.error(e);
});

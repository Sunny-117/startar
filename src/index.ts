import minimist from "minimist";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { copy, emptyDir, formatTargetDir, isEmpty, renameFiles } from "./utils";
import { helpMessage } from "./helper";
import prompts from "prompts";
import { blue, cyan, green, red, reset, yellow } from "picocolors";
import { Framework } from "./types";

const argv = minimist<{
  template?: string;
  help?: boolean;
}>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: "help", t: "template" },
  string: ["_"],
});
const cwd = process.cwd();
const defaultTargetDir = "startar-project";

const FRAMEWORKS: Framework[] = [
  {
    name: "monorepo-starter",
    display: "monorepo-starter",
    color: yellow,
  },
  {
    name: "starter-ts-tsup",
    display: "starter-ts-tsup",
    color: green,
  },
  {
    name: "starter-ts-unbuild",
    display: "starter-ts-unbuild",
    color: blue,
  },
  {
    name: "starter-ts-vite",
    display: "starter-ts-vite",
    color: cyan,
  },
];

const TEMPLATES = FRAMEWORKS.map((f) => [f.name]).reduce(
  (a, b) => a.concat(b),
  []
);

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<"projectName" | "overwrite" | "framework">;

  prompts.override({
    overwrite: argv.overwrite,
  });

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "select",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          initial: 0,
          choices: [
            {
              title: "Remove existing files and continue",
              value: "yes",
            },
            {
              title: "Cancel operation",
              value: "no",
            },
            {
              title: "Ignore files and continue",
              value: "ignore",
            },
          ],
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
          name: "framework",
          message:
            typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a framework:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }
  // user choice associated with prompts
  const { framework, overwrite } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite === "yes") {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  let template: string = framework?.name || argTemplate;
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `templates/${template}`
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");
}
init().catch((e) => {
  console.error(e);
});

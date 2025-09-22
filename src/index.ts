import minimist from "minimist";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { copy, emptyDir, formatTargetDir, isEmpty, renameFiles, validateProjectName, validateTargetDirectory, replacePlaceholders, customizePackageJson, validateTemplate, getTemplateDir } from "./utils";
import { helpMessage } from "./helper";
import prompts from "prompts";
import { blue, cyan, green, red, reset, yellow } from "picocolors";
import { Framework, ProjectConfig } from "./types";

const argv = minimist<{
  template?: string;
  help?: boolean;
  version?: boolean;
  list?: boolean;
  yes?: boolean;
  author?: string;
  description?: string;
  license?: string;
  packageManager?: string;
  noGit?: boolean;
  noDeps?: boolean;
}>(process.argv.slice(2), {
  default: { help: false, version: false, list: false, yes: false, noGit: false, noDeps: false },
  alias: {
    h: "help",
    t: "template",
    v: "version",
    l: "list",
    y: "yes",
    a: "author",
    d: "description",
    L: "license",
    p: "packageManager",
    "no-git": "noGit",
    "no-deps": "noDeps"
  },
  string: ["_"],
});
const cwd = process.cwd();
const defaultTargetDir = "startar-project";

const FRAMEWORKS: Framework[] = [
  {
    name: "monorepo-starter",
    display: "Monorepo Starter",
    color: yellow,
    description: "Multi-package repository with changesets",
    features: ["Monorepo", "Changesets", "TypeScript", "ESLint"],
  },
  {
    name: "starter-ts-tsup",
    display: "TypeScript + tsup",
    color: green,
    description: "TypeScript library with tsup bundler",
    features: ["TypeScript", "tsup", "Vitest", "ESLint"],
  },
  {
    name: "starter-ts-unbuild",
    display: "TypeScript + unbuild",
    color: blue,
    description: "TypeScript library with unbuild",
    features: ["TypeScript", "unbuild", "Vitest", "ESLint"],
  },
  {
    name: "starter-ts-vite",
    display: "TypeScript + Vite",
    color: cyan,
    description: "Frontend utility library with Vite",
    features: ["TypeScript", "Vite", "Rollup", "Monorepo"],
  },
];

const TEMPLATES = FRAMEWORKS.map((f) => f.name);

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  const help = argv.help;
  const version = argv.version;
  const list = argv.list;

  if (help) {
    console.log(helpMessage);
    return;
  }

  if (version) {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(fileURLToPath(import.meta.url), "../..", "package.json"), "utf-8"));
    console.log(`startar v${pkg.version}`);
    return;
  }

  if (list) {
    console.log(`${cyan("Available templates:")}\n`);
    FRAMEWORKS.forEach(framework => {
      const color = framework.color;
      console.log(`  ${color(framework.name.padEnd(20))} ${framework.description || ''}`);
      if (framework.features && framework.features.length > 0) {
        console.log(`    ${framework.features.map(f => `• ${f}`).join(' ')}\n`);
      }
    });
    return;
  }

  let targetDir = argTargetDir || defaultTargetDir;

  // Validate target directory if provided as argument
  if (argTargetDir) {
    const nameValidation = validateProjectName(targetDir);
    if (nameValidation !== true) {
      console.log(red("✖") + ` ${nameValidation}`);
      return;
    }

    const dirValidation = validateTargetDirectory(targetDir);
    if (dirValidation !== true) {
      console.log(red("✖") + ` ${dirValidation}`);
      return;
    }
  }

  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<"projectName" | "overwrite" | "framework" | "author" | "description" | "license" | "packageManager" | "initGit" | "installDeps">;

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
          validate: (value: string) => {
            const formatted = formatTargetDir(value) || defaultTargetDir;
            const nameValidation = validateProjectName(formatted);
            if (nameValidation !== true) {
              return nameValidation;
            }
            const dirValidation = validateTargetDirectory(formatted);
            if (dirValidation !== true) {
              return dirValidation;
            }
            return true;
          },
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
              description: framework.description,
              value: framework,
            };
          }),
        },
        {
          type: argv.yes || argv.author ? null : "text",
          name: "author",
          message: reset("Author name:"),
          initial: "",
        },
        {
          type: argv.yes || argv.description ? null : "text",
          name: "description",
          message: reset("Project description:"),
          initial: "",
        },
        {
          type: argv.yes || argv.license ? null : "select",
          name: "license",
          message: reset("License:"),
          initial: 0,
          choices: [
            { title: "MIT", value: "MIT" },
            { title: "Apache-2.0", value: "Apache-2.0" },
            { title: "GPL-3.0", value: "GPL-3.0" },
            { title: "BSD-3-Clause", value: "BSD-3-Clause" },
            { title: "ISC", value: "ISC" },
            { title: "None", value: "" },
          ],
        },
        {
          type: argv.yes || argv.packageManager ? null : "select",
          name: "packageManager",
          message: reset("Package manager:"),
          initial: 2,
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
          ],
        },
        {
          type: argv.yes || argv.noGit ? null : "confirm",
          name: "initGit",
          message: reset("Initialize git repository?"),
          initial: true,
        },
        {
          type: argv.yes || argv.noDeps ? null : "confirm",
          name: "installDeps",
          message: reset("Install dependencies?"),
          initial: true,
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

  // Use CLI arguments or prompt results
  const author = argv.author || result.author || '';
  const description = argv.description || result.description || '';
  const license = argv.license || result.license || 'MIT';
  const packageManager = (argv.packageManager || result.packageManager || 'pnpm') as 'npm' | 'yarn' | 'pnpm';
  const initGit = argv.noGit ? false : (result.initGit ?? true);
  const installDeps = argv.noDeps ? false : (result.installDeps ?? true);

  const root = path.join(cwd, targetDir);

  if (overwrite === "yes") {
    emptyDir(root);
  } else if (overwrite === "no") {
    console.log(yellow("Operation cancelled"));
    return;
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // Ensure directory exists
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  let template: string = framework?.name || argTemplate;

  if (!template) {
    console.log(red("✖") + " No template specified");
    return;
  }

  const baseTemplateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    "templates"
  );

  const templateDir = getTemplateDir(template, baseTemplateDir);

  // Validate template
  const templateValidation = validateTemplate(templateDir);
  if (templateValidation !== true) {
    console.log(red("✖") + ` ${templateValidation}`);
    if (!template.includes('/') && !template.includes('\\')) {
      console.log(`Available built-in templates: ${TEMPLATES.join(", ")}`);
    }
    return;
  }

  // Create project configuration
  const projectConfig: ProjectConfig = {
    name: getProjectName(),
    author: author || '',
    description: description || '',
    license: license || 'MIT',
    packageManager: packageManager || 'pnpm',
    initGit: initGit ?? true,
    installDeps: installDeps ?? true,
  };

  const writeWithCustomization = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      const customizedContent = replacePlaceholders(content, projectConfig);
      fs.writeFileSync(targetPath, customizedContent);
    } else {
      const srcPath = path.join(templateDir, file);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        copy(srcPath, targetPath);
      } else {
        // Read file and apply customizations
        const originalContent = fs.readFileSync(srcPath, 'utf-8');
        const customizedContent = replacePlaceholders(originalContent, projectConfig);
        fs.writeFileSync(targetPath, customizedContent);
      }
    }
  };

  try {
    const files = fs.readdirSync(templateDir);
    for (const file of files.filter((f) => f !== "package.json")) {
      writeWithCustomization(file);
    }

    // Handle package.json with full customization
    const pkgPath = path.join(templateDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const originalPkgContent = fs.readFileSync(pkgPath, "utf-8");
      const customizedPkgContent = customizePackageJson(originalPkgContent, projectConfig);
      writeWithCustomization("package.json", customizedPkgContent);
    }

    console.log(`\n${green("✓")} Project created successfully!`);
    console.log(`${cyan("📁")} Location: ${root}`);

    // Post-processing
    if (projectConfig.initGit) {
      try {
        const { spawn } = await import('cross-spawn');
        const gitInit = spawn('git', ['init'], { cwd: root, stdio: 'ignore' });
        await new Promise<void>((resolve, reject) => {
          gitInit.on('close', (code: number | null) => {
            if (code === 0) {
              console.log(`${green("✓")} Git repository initialized`);
              resolve();
            } else {
              reject(new Error(`Git init failed with code ${code}`));
            }
          });
        });
      } catch (error) {
        console.log(`${yellow("⚠")} Failed to initialize git repository: ${error instanceof Error ? error.message : error}`);
      }
    }

    if (projectConfig.installDeps) {
      try {
        console.log(`${cyan("⏳")} Installing dependencies with ${projectConfig.packageManager}...`);
        const { spawn } = await import('cross-spawn');
        const installCmd = projectConfig.packageManager === 'yarn' ? 'yarn' :
          projectConfig.packageManager === 'npm' ? 'npm' : 'pnpm';
        const installArgs = projectConfig.packageManager === 'npm' ? ['install'] :
          projectConfig.packageManager === 'yarn' ? [] : ['install'];

        const install = spawn(installCmd, installArgs, { cwd: root, stdio: 'inherit' });
        await new Promise<void>((resolve, reject) => {
          install.on('close', (code: number | null) => {
            if (code === 0) {
              console.log(`${green("✓")} Dependencies installed successfully`);
              resolve();
            } else {
              reject(new Error(`Installation failed with code ${code}`));
            }
          });
        });
      } catch (error) {
        console.log(`${yellow("⚠")} Failed to install dependencies: ${error instanceof Error ? error.message : error}`);
        console.log(`You can install them manually by running:`);
        console.log(`  cd ${targetDir}`);
        console.log(`  ${projectConfig.packageManager} install`);
      }
    }

    console.log(`\n${green("🎉")} All done! Your project is ready.`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${targetDir}`);
    if (!projectConfig.installDeps) {
      console.log(`  ${projectConfig.packageManager} install`);
    }
    console.log(`  ${projectConfig.packageManager} dev\n`);

  } catch (error) {
    console.log(red("✖") + ` Failed to create project: ${error instanceof Error ? error.message : error}`);
    return;
  }
}
init().catch((e) => {
  console.error(e);
});

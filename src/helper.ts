import colors from "picocolors";

const { cyan, green, yellow, redBright } = colors;

export const helpMessage = `\
Usage: startar [OPTION]... [DIRECTORY]

Create a new starter project in TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template (built-in name or path)
  -a, --author NAME          set author name
  -d, --description TEXT     set project description
  -L, --license LICENSE      set license (MIT, Apache-2.0, GPL-3.0, etc.)
  -p, --packageManager PM    set package manager (npm, yarn, pnpm)
  -y, --yes                  skip prompts and use defaults
  -l, --list                 list available templates
  --no-git                   skip git initialization
  --no-deps                  skip dependency installation
  -v, --version              show version
  -h, --help                 show this help

Available templates:
${yellow("monorepo-starter       Multi-package repository with changesets")}
${green("starter-ts-tsup        TypeScript library with tsup bundler")}
${cyan("starter-ts-unbuild     TypeScript library with unbuild")}
${redBright("starter-ts-vite        Frontend utility library with Vite")}

Examples:
  startar my-project                    # Interactive mode
  startar my-lib -t starter-ts-tsup     # Use built-in template
  startar my-lib -t ./my-template       # Use custom template
  startar my-lib -y -a "John Doe"       # Skip prompts with author
  startar --list                        # List all templates`;

import colors from "picocolors";

const { cyan, green, yellow, redBright } = colors;

export const helpMessage = `\
Usage: startar [OPTION]... [DIRECTORY]

Create a new starter project in TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow("monorepo-starter     monorepo")}
${green("starter-ts-tsup         tsup")}
${cyan("starter-ts-unbuild       unbuild")}
${redBright("starter-ts-vite   vite")}`;

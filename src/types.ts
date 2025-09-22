export type ColorFunc = (str: string | number) => string;

export type Framework = {
  name: string;
  display: string;
  color: ColorFunc;
  description?: string;
  features?: string[];
};

export type ProjectConfig = {
  name: string;
  author?: string;
  email?: string;
  description?: string;
  license?: string;
  repository?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  initGit?: boolean;
  installDeps?: boolean;
};

export type TemplateCustomization = {
  placeholders: Record<string, string>;
  fileReplacements: Record<string, string>;
  conditionalFiles?: Record<string, boolean>;
};

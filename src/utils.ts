import fs from "node:fs";
import path from "node:path";
import { ProjectConfig } from "./types";
/**
 * 去除多余的空格和尾部的斜杠
 * @param targetDir
 * @returns
 */
export function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

export function isEmpty(path: string) {
  try {
    const files = fs.readdirSync(path);
    return files.length === 0 || (files.length === 1 && files[0] === ".git");
  } catch (error) {
    // If directory doesn't exist or can't be read, consider it empty
    return true;
  }
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

/**
 * Validate project name
 * @param name Project name to validate
 * @returns true if valid, error message if invalid
 */
export function validateProjectName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return "Project name cannot be empty";
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return "Project name can only contain letters, numbers, dots, hyphens, and underscores";
  }

  // Check if it starts with a dot or hyphen
  if (name.startsWith('.') || name.startsWith('-')) {
    return "Project name cannot start with a dot or hyphen";
  }

  // Check length
  if (name.length > 214) {
    return "Project name is too long (max 214 characters)";
  }

  return true;
}

/**
 * Check if a directory is safe to use as target
 * @param dir Directory path to check
 * @returns true if safe, error message if not
 */
export function validateTargetDirectory(dir: string): true | string {
  try {
    const resolved = path.resolve(dir);

    // Check if it's a system directory
    const systemDirs = ['/bin', '/usr', '/etc', '/var', '/sys', '/proc'];
    if (systemDirs.some(sysDir => resolved.startsWith(sysDir))) {
      return "Cannot create project in system directories";
    }

    // Check if parent directory exists and is writable
    const parent = path.dirname(resolved);
    if (!fs.existsSync(parent)) {
      return `Parent directory ${parent} does not exist`;
    }

    try {
      fs.accessSync(parent, fs.constants.W_OK);
    } catch {
      return `No write permission for directory ${parent}`;
    }

    return true;
  } catch (error) {
    return `Invalid directory path: ${error instanceof Error ? error.message : error}`;
  }
}

/**
 * Replace placeholders in file content
 * @param content File content
 * @param config Project configuration
 * @returns Content with placeholders replaced
 */
export function replacePlaceholders(content: string, config: ProjectConfig): string {
  const placeholders: Record<string, string> = {
    '{{PROJECT_NAME}}': config.name,
    '{{AUTHOR}}': config.author || '',
    '{{EMAIL}}': config.email || '',
    '{{DESCRIPTION}}': config.description || '',
    '{{LICENSE}}': config.license || 'MIT',
    '{{REPOSITORY}}': config.repository || '',
    '{{PACKAGE_MANAGER}}': config.packageManager || 'pnpm',
    // Common template placeholders
    'pkg-placeholder': config.name,
    'project-name': config.name,
    'ts-lib-starter': config.name,
    'ts-lib-vite': config.name,
    '_description_': config.description || 'A TypeScript project',
    'antfu': config.author || 'author',
    'sxzz': config.author || 'author',
    'Sunny-117': config.author || 'author',
    '三咲智子 Kevin Deng': config.author || 'author',
    'Anthony Fu': config.author || 'author',
  };

  let result = content;
  for (const [placeholder, replacement] of Object.entries(placeholders)) {
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }

  return result;
}

/**
 * Process package.json with customizations
 * @param pkgContent Original package.json content
 * @param config Project configuration
 * @returns Updated package.json content
 */
export function customizePackageJson(pkgContent: string, config: ProjectConfig): string {
  try {
    const pkg = JSON.parse(pkgContent);

    // Update basic fields
    pkg.name = config.name;
    if (config.description) pkg.description = config.description;
    if (config.author) pkg.author = config.author;
    if (config.license) pkg.license = config.license;

    // Update repository if provided
    if (config.repository) {
      pkg.repository = {
        type: "git",
        url: config.repository
      };
      pkg.bugs = {
        url: `${config.repository}/issues`
      };
      pkg.homepage = `${config.repository}#readme`;
    }

    // Set package manager (remove @latest to avoid warnings)
    if (config.packageManager && config.packageManager !== 'npm') {
      pkg.packageManager = config.packageManager;
    }

    // Clean up author-specific dependencies that might not exist
    if (pkg.devDependencies) {
      const authorSpecificDeps = Object.keys(pkg.devDependencies).filter(dep =>
        dep.includes('@sxzz/') ||
        dep.includes('@antfu/') ||
        dep.includes('@Sunny-117/') ||
        (config.author && dep.includes(`@${config.author}/`))
      );

      // Remove author-specific dependencies if author is different
      authorSpecificDeps.forEach(dep => {
        if (!dep.includes(`@${config.author}/`)) {
          delete pkg.devDependencies[dep];
        }
      });
    }

    return JSON.stringify(pkg, null, 2) + '\n';
  } catch (error) {
    throw new Error(`Failed to customize package.json: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Validate if a directory is a valid template
 * @param templateDir Path to template directory
 * @returns true if valid, error message if not
 */
export function validateTemplate(templateDir: string): true | string {
  try {
    if (!fs.existsSync(templateDir)) {
      return "Template directory does not exist";
    }

    if (!fs.statSync(templateDir).isDirectory()) {
      return "Template path is not a directory";
    }

    // Check for required files
    const packageJsonPath = path.join(templateDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return "Template must contain a package.json file";
    }

    // Validate package.json
    try {
      const pkgContent = fs.readFileSync(packageJsonPath, "utf-8");
      JSON.parse(pkgContent);
    } catch {
      return "Template package.json is not valid JSON";
    }

    return true;
  } catch (error) {
    return `Failed to validate template: ${error instanceof Error ? error.message : error}`;
  }
}

/**
 * Get template directory path, supporting both built-in and custom templates
 * @param templateName Template name or path
 * @param baseDir Base directory for built-in templates
 * @returns Template directory path
 */
export function getTemplateDir(templateName: string, baseDir: string): string {
  // If it's an absolute path or relative path with slashes, treat as custom template
  if (path.isAbsolute(templateName) || templateName.includes('/') || templateName.includes('\\')) {
    return path.resolve(templateName);
  }

  // Otherwise, treat as built-in template
  return path.join(baseDir, templateName);
}

export function copy(src: string, dest: string) {
  try {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (error) {
    throw new Error(`Failed to copy ${src} to ${dest}: ${error instanceof Error ? error.message : error}`);
  }
}

function copyDir(srcDir: string, destDir: string) {
  try {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.resolve(srcDir, file);
      const destFile = path.resolve(destDir, file);
      copy(srcFile, destFile);
    }
  } catch (error) {
    throw new Error(`Failed to copy directory ${srcDir} to ${destDir}: ${error instanceof Error ? error.message : error}`);
  }
}

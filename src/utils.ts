/**
 * 去除多余的空格和尾部的斜杠
 * @param targetDir
 * @returns
 */
export function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

import colors from "picocolors";
import { spawn } from "child_process";
import chokidar from "chokidar";
const { green } = colors;

const command = "pnpm";
const args = ["start"];

let child: any = null; // 用于跟踪当前的子进程

function runCommand() {
  // 如果已经有一个子进程在运行，先结束它
  if (child) {
    console.log(green("正在重启子进程..."));
  }

  // 启动新的子进程
  child = spawn(command, args, {
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error(`执行命令时发生错误: ${error.message}`);
  });

  child.on("exit", (code) => {
    console.log(`子进程退出，退出码: ${code}`);
  });
}

runCommand();

const watcher = chokidar.watch("src/**/*", {
  persistent: true,
});

watcher.on("all", (event, path) => {
  console.log(green(`文件 ${path} 发生变化。`));
  runCommand(); // 文件变化时运行新的命令
});

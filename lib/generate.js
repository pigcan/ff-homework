const os = require('os');
const path = require('path');
const fs = require('fs');

const fse = require('fs-extra');
const exec = require('sync-exec');
const chalk = require('chalk');

const { AUDIOREG, IMAGEREG } = require('../util/global');
const { generatePandocCMD } = require('../util/cmd');

const tmpDir = os.tmpdir();
const cwd = process.cwd();

function generateHomework(config) {
  // step 1
  // 从用户选择的作业中分析 audio 标签和图片信息，获取文件中的音频和图片地址信息
  //    生成新的 md 文件，并将其输出到临时目录 - 临时目录以作业名加时间戳决定
  //    拷贝相关的音频和图片文件至临时目录
  const verbose = config.verbose;
  const pandoc = config.pandoc;
  const homework = config.homework;
  const output = config.output;
  const filename = path.basename(homework, '.md');
  const finalHomeworkPath = path.join(output, `${filename}.html`);
  const outputTmpDir = path.join(tmpDir, `${filename}-${new Date().getTime()}`);
  let homeworkContent = fs.readFileSync(homework).toString();

  const audioMatchedList = [...homeworkContent.matchAll(AUDIOREG)];
  const imageMatchedList = [...homeworkContent.matchAll(IMAGEREG)];

  const audioPathList = [];
  const imagePathList = [];

  if (audioMatchedList.length > 0) {
    audioMatchedList.forEach((audio) => {
      const audioString = audio[0];
      const audioPath = audio[1];
      homeworkContent = homeworkContent.replace(audioString, `<p><audio controls src="${audioPath}"></audio></p>`);
      audioPathList.push(path.join(cwd, audio[1]));
    });
  }

  if (imageMatchedList.length > 0) {
    imageMatchedList.forEach((audio) => {
      const imageString = audio[0];
      const imagePath = audio[1];
      homeworkContent = homeworkContent.replace(imageString, `<p><img src="${imagePath}"></p>`);
      imagePathList.push(path.join(cwd, audio[1]));
    });
  }


  const tmpHomeworkPath = path.join(outputTmpDir, `${filename}.md`);
  fse.outputFileSync(tmpHomeworkPath, homeworkContent);
  audioPathList.concat(imagePathList).forEach((item) => {
    const basename = path.basename(item);
    fse.copySync(item, path.join(outputTmpDir, basename));
  });

  if (verbose) {
    console.info(chalk.grey('outputTmpDir =>', outputTmpDir));
    console.info(chalk.grey('audioPathList =>', audioPathList));
    console.info(chalk.grey('imagePathList =>', imagePathList));
  }

  //  step 2
  //  调用 Pandoc 生成 html，并输出至指定目录
  const filterPath = path.resolve(__dirname, `lua${path.sep}math_block.lua`);
  fse.outputFileSync(finalHomeworkPath, '');
  const cmd = generatePandocCMD(pandoc, outputTmpDir, filterPath, filename, finalHomeworkPath, tmpHomeworkPath);
  const result = exec(cmd);
  if (result.stderr) {
    console.error(chalk.red(`Failed: ${cmd}`));
    if (verbose) {
      console.error(chalk.red(result.stderr));
    }
    process.exit(-1);
  }
  console.info(chalk.green(`成功生成作业, 路径在 ${finalHomeworkPath}`));
  process.exit(0);
}

module.exports = generateHomework;
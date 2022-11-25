const path = require('path');

const globby = require('globby');
const uniq = require('lodash.uniq');
const flattenDeep = require('lodash.flattendeep');
const chalk = require('chalk');
const difference = require('lodash.difference');
const trash = require('trash');

const { fetchUsedAttachments, fetchAllAttachments } = require('../util/fetch');

/**
 * 根据当前给定资源目录，分析 md 中引用情况，最终把未被使用的资源移入到回收站
 * @param cwd 资源目录
 * @param verbose 是否开启日志模式
 * @param caseSensitive 文件匹配时是否需要大小写敏感，'1' 代表不敏感，'0' 代表敏感
 * @returns {Promise<unknown>}
 */

function clean(cwd, verbose, caseSensitive) {
  const mdFiles = globby.sync(['**/*.md'], {
    cwd,
  });
  // 采用异步方式，提升效率
  const usedPromiseList = mdFiles.map((file) => fetchUsedAttachments(cwd, file, caseSensitive));

  return new Promise((resolve, reject) => {
    Promise.all(usedPromiseList).then((result) => {
      // 拍平数据结构，并对引用资源去重，最终得到完整的被引用文件列表
      const usedFileList = uniq(flattenDeep(result));
      if (verbose) {
        console.info(chalk.green(`\nTotal ${usedFileList.length} files are used in md files: \n${usedFileList.join(' , ')}`));
      }
      fetchAllAttachments(cwd).then((res) => {
        const attachments = caseSensitive === '0' ? res : res.map((r) => r.toLowerCase());
        const unUsedFileList = difference(attachments, usedFileList);
        if (verbose) {
          console.info(chalk.green(`\nTotal ${attachments.length} files are stored in directory: \n${attachments.join(' , ')}`));
          if (unUsedFileList.length > 0) {
            console.info(chalk.cyan(`\nTotal ${unUsedFileList.length} files are all unused attachments: \n${unUsedFileList.join(' , ')}`))
          } else {
            console.info(chalk.cyan(`\nNo need to clean!`));
          }
        }

        if (unUsedFileList.length > 0) {
          const resolvedUnUsedFileList = unUsedFileList.map((f) => path.resolve(cwd, f));

          trash(resolvedUnUsedFileList, {
            glob: false,
          }).then(() => resolve()).catch((err) => reject(err));
        } else {
          resolve();
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

module.exports = clean;
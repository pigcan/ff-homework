const globby = require('globby');

const fs = require('fs');
const path = require('path');

const { AUDIOREG, IMAGEREG } = require('./global');

function fetchAllAttachments(cwd) {
  return globby('**/*.+([wW][eE][bB][mM]|[gG][iI][fF]|[jJ][pP][gG]|[jJ][pP][eE][gG]|[tT][iI][fF]|[tT][iI][fF][fF]|[pP][nN][gG]|[wW][eE][bB][pP]|[bB][mM][pP])', {
    cwd,
  });
}

function fetchUsedAttachments(cwd, filePath, caseSensitive) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(cwd, filePath), (err, data) => {
      if (err) {
        reject(err);
      } else {
        const content = data.toString();
        const audioMatchedList = [...content.matchAll(AUDIOREG)];
        const imageMatchedList = [...content.matchAll(IMAGEREG)];
        const audioMatchedNameList = caseSensitive === '0'
          ? audioMatchedList.map((a) => a[1])
          : audioMatchedList.map((a) => a[1].toLowerCase());

        const imageMatchedNameList = caseSensitive === '0'
          ? imageMatchedList.map((a) => a[1])
          : imageMatchedList.map((i) => i[1].toLowerCase());
        resolve(audioMatchedNameList.concat(imageMatchedNameList));
      }
    });
  })
}

module.exports = {
  fetchAllAttachments,
  fetchUsedAttachments,
};

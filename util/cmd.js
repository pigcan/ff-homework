/*
 * 用于生成 pandoc 命令
 * @pandoc pandoc 路径
 * @rpath 转换文件所在目录路径
 * @lfilter 过滤器路径
 * @title 生成文件的文件名
 * @opath 最终输出目录路径
 * @rfile 所需转化的文件路径
 */
function generatePandocCMD(pandoc, rpath, lfilter, title, opath, rfile) {
  return `${pandoc} -f markdown --resource-path="${rpath}" --lua-filter="${lfilter}" --embed-resources --standalone --metadata title="${title}" -s -o "${opath}" -t html --mathjax="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg-full.js" "${rfile}"`;
}

module.exports = {
  generatePandocCMD,
}
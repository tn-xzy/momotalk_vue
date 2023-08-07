// 下载
// @param  {String} url 目标文件地址
// @param  {String} filename 想要保存的文件名称
function courseDownload(url, filename) {
  getBlob(url, function (blob) {
    saveAs(blob, filename);
  })
}

function getBlob(url, cb) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  }
  xhr.send();
}

// 保存
// @param  {Blob} blob
// @param  {String} filename 想要保存的文件名称
function saveAs(blob, filename) {
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(link.href);
}

export default courseDownload
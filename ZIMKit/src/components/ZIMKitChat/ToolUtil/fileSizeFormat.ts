const fileSizeFormat = (fileSize: number) => {
  let fileSizeStr = '';
  const wrongSize = '0B';
  if (!fileSize) {
    return wrongSize;
  }
  if (fileSize < 1024) {
    fileSizeStr = fileSize.toFixed(2) + ' B';
  } else if (fileSize < 1048576) {
    fileSizeStr = (fileSize / 1024).toFixed(2) + ' KB';
  } else if (fileSize < 1073741824) {
    fileSizeStr = (fileSize / 1048576).toFixed(2) + ' MB';
  } else {
    fileSizeStr = (fileSize / 1073741824).toFixed(2) + ' GB';
  }
  return fileSizeStr;
};

export { fileSizeFormat };

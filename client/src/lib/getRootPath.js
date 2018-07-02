// TODO: rename file to 'getPaths'.

export default function getRootPath() {
  let rootPath = '/';
  if (process.env.REACT_APP_RELATIVE_URL_ROOT) {
    rootPath = `${process.env.REACT_APP_RELATIVE_URL_ROOT}${rootPath}`;
  }

  return rootPath;
}

export function getSpreadsheetPathTemplate() {
  return `${getRootPath()}:shortId`;
}

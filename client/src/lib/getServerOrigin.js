// TODO: to package.
export default () => {
  const clientOriginSplitted = window.location.origin.split(/:/);
  const serverOriginSplitted = [...clientOriginSplitted];
  const probablyPort = serverOriginSplitted[serverOriginSplitted.length - 1];

  const serverPort = process.env.REACT_APP_SERVER_PORT || 4000;

  // serverOriginSplitted
  // => ['http', '//localhost', '5100']
  if (serverOriginSplitted.length === 3 && probablyPort.match(/^\d+$/)) {
    serverOriginSplitted[serverOriginSplitted.length - 1] = serverPort;
  }

  let serverOrigin = serverOriginSplitted.join(':');
  if (process.env.REACT_APP_RELATIVE_URL_ROOT) {
    serverOrigin += process.env.REACT_APP_RELATIVE_URL_ROOT;
  }

  return serverOrigin;
};

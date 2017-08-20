// TODO: to package.
const getServerOrigin = () => {
  const clientOriginSplitted = window.location.origin.split(/:/);
  const serverOriginSplitted = [...clientOriginSplitted];
  const probablyPort = serverOriginSplitted[serverOriginSplitted.length - 1];

  // serverOriginSplitted
  // => ['http', '//localhost', '5100']
  if (serverOriginSplitted.length === 3 && probablyPort.match(/^\d+$/)) {
    serverOriginSplitted[serverOriginSplitted.length - 1] =
      process.env.REACT_APP_SERVER_PORT;
  }

  let serverOrigin = serverOriginSplitted.join(':');
  if (process.env.REACT_APP_RELATIVE_URL_ROOT) {
    serverOrigin += process.env.REACT_APP_RELATIVE_URL_ROOT;
  }

  return serverOrigin;
};

export default getServerOrigin;

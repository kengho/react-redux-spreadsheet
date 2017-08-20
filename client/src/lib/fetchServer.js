// TODO: to package.
import getServerOrigin from './getServerOrigin';

const fetchServer = (method, action, body = {}) => {
  const serverOrigin = getServerOrigin();
  const headers = new Headers(); // eslint-disable-line no-undef
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  // CORS for development setup.
  headers.append('Origin', window.location.origin); // eslint-disable-line no-undef

  const fetchParams = {
    method,
    headers,
    mode: 'cors',
  };
  if (method !== 'GET') {
    fetchParams.body = JSON.stringify(body);
  }

  const promise = fetch( // eslint-disable-line no-undef
    `${serverOrigin}/api/v1/${action}`,
    fetchParams
  )
    .then((response) => response.json());

  return promise;
};

export default fetchServer;

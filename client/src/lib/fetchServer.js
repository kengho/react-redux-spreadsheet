// TODO: to package.
import getServerOrigin from './getServerOrigin';

export default (method, action, body = {}) => {
  const serverOrigin = getServerOrigin();
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  // NOTE: CORS for development setup.
  headers.append('Origin', window.location.origin);

  const fetchParams = {
    method,
    headers,
    mode: 'cors',
  };
  if (method !== 'GET') {
    fetchParams.body = JSON.stringify(body);
  }

  const promise = fetch(
    `${serverOrigin}/api/v1/${action}`,
    fetchParams
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return {
          errors: [{ detail: 'Sorry, server error occurred, please try later.' }],
        };
      }
    })
    .catch((error) => ({ errors: [{ detail: error.message }] }));

  return promise;
};

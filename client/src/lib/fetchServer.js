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
    .then((response) => response.json())
    .catch((error) => {
      return {
        errors: [{ detail: error.message }],
      };
    });

  return promise;
};

export default fetchServer;

// Some snippet to test failed requests.
// .then((response) => {
//   if (method === 'PATCH') {
//     return {
//       errors: [{ detail: 'detail' }],
//     };
//   } else {
//     return response.json();
//   }
// })

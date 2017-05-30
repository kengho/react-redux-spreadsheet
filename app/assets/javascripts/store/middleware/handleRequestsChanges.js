// TODO: save batched changes periodically.

import {
  popRequestId,
  markRequestAsFailed,
} from '../../actions/requests';

const REQUEST_RETRY_TIMEOUT = 60 * 1000; // 1 min

const composeRequest = (store, action) => {
  const url = store.getState().get('meta').get('shortId');

  let data;
  if (action.type === 'POP_REQUEST_ID') {
    // 0-th request is popping, so we should handle 1-th now.
    data = store.getState().get('requests').get('queue').get(1)
      .toJS();
  } else {
    data = { ...action };
  }

  // Prevents server to handle outdated requests.
  const counter = store.getState().get('requests').get('counter');
  return ({
    url,
    method: data.method,
    params: { ...data.params, ...{ id: data.id }, ...{ counter } },
  });
};

const sendRequest = (composedRequest) => {
  // TODO: for some reason CSRF-Tokens don't work,
  //   fugure out why (see spreadsheet_controller.rb for details).
  const headers = new Headers(); // eslint-disable-line no-undef
  // const authTokenParam = document.querySelector('meta[name="csrf-param"]').content;
  // const authToken = document.querySelector('meta[name="csrf-token"]').content;
  // headers.append('X-CSRF-Token', authToken);
  // // headers.append(authTokenParam, authToken);
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  let responsePromise;
  if (composedRequest.method !== 'GET') {
    responsePromise = fetch( // eslint-disable-line no-undef
      composedRequest.url,
      {
        method: composedRequest.method,
        headers,
        body: JSON.stringify(composedRequest.params),
      }
    )
    .then((response) => response.json())
    .then((json) => json.status);
  }

  return responsePromise;
};

const handleResponse = (store, composedRequest, response) => {
  if (response !== 'OK') {
    store.dispatch(markRequestAsFailed(composedRequest.params.id));
  } else if (composedRequest.method === 'DELETE') {
    location.reload(); // eslint-disable-line no-undef
  } else {
    store.dispatch(popRequestId(composedRequest.params.id));
  }
};

const handleRequest = (store, composedRequest) => {
  sendRequest(composedRequest).then(
    (response) => {
      handleResponse(
        store,
        composedRequest,
        response
      );
    }
  );
};

const handleRequestsChanges = store => next => action => {
  const requests = store.getState().get('requests').get('queue').toJS();

  let composedRequest;
  if (action.type === 'PUSH_REQUEST') {
    // If there are more than one request in stack,
    // there is already a request processing via 'MARK_REQUEST_AS_FAILED' branch.
    if (requests.length > 0) {
      return next(action);
    }

    composedRequest = composeRequest(store, action);
    handleRequest(store, composedRequest);
  }

  if (action.type === 'POP_REQUEST_ID') {
    // If we popping last request in queue, there is nothing to do.
    if (requests.length === 1) {
      return next(action);
    }

    composedRequest = composeRequest(store, action);
    handleRequest(store, composedRequest);
  }

  if (action.type === 'MARK_REQUEST_AS_FAILED') {
    const request = requests.find((someRequest) => someRequest.id === action.id);

    if (!request) {
      return next(action);
    }

    composedRequest = composeRequest(store, request);
    setTimeout((() => {
      handleRequest(store, composedRequest);
    }), REQUEST_RETRY_TIMEOUT);
  }

  return next(action);
};

export default handleRequestsChanges;

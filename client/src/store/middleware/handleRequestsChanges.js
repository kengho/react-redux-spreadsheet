// TODO: save batched changes periodically instead.

import {
  popRequestId,
  markRequestAsFailed,
} from '../../actions/requests';
import fetchServer from './../../lib/fetchServer';
import getRootPath from './../../lib/getRootPath';

const REQUEST_RETRY_TIMEOUT = 60 * 1000; // 1 min

const composeRequest = (store, action) => {

  let data;
  if (action.type === 'POP_REQUEST_ID') {
    // 0-th request is popping, so we should handle 1-th now.
    data = store.getState().get('requests').get('queue').get(1)
      .toJS();
  } else {
    data = { ...action };
  }

  const shortId = store.getState().get('meta').get('shortId');

  // Counter prevents server from handling outdated requests.
  const counter = store.getState().get('requests').get('counter');
  return ({
    action: data.action,
    method: data.method,
    params: {
      ...data.params,
      ...{ id: data.id },
      ...{ updates_counter: counter },
      ...{ short_id: shortId },
    },
  });
};

const sendRequest = (composedRequest) => {
  let responsePromise;
  responsePromise = fetchServer(
    composedRequest.method,
    composedRequest.action,
    composedRequest.params
  )
    .then((json) => json.data.status);

  return responsePromise;
};

const handleResponse = (store, composedRequest, responseStatus) => {
  if (responseStatus !== 'OK') {
    store.dispatch(markRequestAsFailed(composedRequest.params.id));
  } else if (composedRequest.method === 'DELETE') {
    const rootPath = getRootPath();
    window.location.replace(rootPath); // eslint-disable-line no-undef
  } else {
    store.dispatch(popRequestId(composedRequest.params.id));
  }
};

const handleRequest = (store, composedRequest) => {
  sendRequest(composedRequest).then(
    (responseStatus) => {
      handleResponse(
        store,
        composedRequest,
        responseStatus
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

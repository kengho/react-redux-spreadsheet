// TODO: save batched changes periodically instead.

import { push } from 'react-router-redux';

import {
  requestsPopId,
  requestsMarkAsFailed,
} from '../../actions/requests';
import fetchServer from './../../lib/fetchServer';
import getRootPath from './../../lib/getRootPath';

const REQUEST_RETRY_TIMEOUT = 60 * 1000; // 1 min

const composeRequest = (store, action) => {
  let data;
  if (action.type === 'REQUESTS/POP_ID') {
    // 0-th request is popping, so we should handle 1-th now.
    data = store.getState().get('requests').get('queue').get(1).toJS();
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
      ...{ request_uuid: data.id },
      ...{ updates_counter: counter },
      ...{ short_id: shortId },
    },
  });
};

const sendRequest = (composedRequest) => {
  // TODO: handle errors.
  let responsePromise;
  responsePromise = fetchServer(
    composedRequest.method,
    composedRequest.action,
    composedRequest.params
  );

  return responsePromise;
};

const handleResponse = (store, composedRequest, response) => {
  if (response.data.status !== 'OK') {
    store.dispatch(requestsMarkAsFailed(response.request_uuid));
  } else {
    store.dispatch(requestsPopId(response.request_uuid));
  }

  if (composedRequest.method === 'DELETE') {
    store.dispatch(push(getRootPath()));
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

const handleRequestsOnQueueChanges = store => next => action => {
  if (!action.type.match('REQUEST')) {
    return next(action);
  }

  const requests = store.getState().get('requests').get('queue');

  let composedRequest;
  if (action.type === 'REQUESTS/PUSH') {
    // If there are more than one request in stack,
    // there is already a request processing via 'MARK_REQUEST_AS_FAILED' branch.
    if (requests.size > 0) {
      return next(action);
    }

    composedRequest = composeRequest(store, action);
    handleRequest(store, composedRequest);
  }

  if (action.type === 'REQUESTS/POP_ID') {
    // If we popping last request in queue, there is nothing to do.
    if (requests.size === 1) {
      return next(action);
    }

    composedRequest = composeRequest(store, action);
    handleRequest(store, composedRequest);
  }

  if (action.type === 'REQUESTS/MARK_AS_FAILED') {
    const request = requests.find((someRequest) => someRequest.get('id') === action.id);

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

export default handleRequestsOnQueueChanges;
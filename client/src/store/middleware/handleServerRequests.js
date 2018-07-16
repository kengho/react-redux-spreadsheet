import { push } from 'connected-react-router/immutable';

import { closeDialog } from '../../actions/ui';
import {
  makeServerRequest,
  setRequestFailed,
} from '../../actions/server';
import {
  SYNC,
  DESTROY_SPREADSHEET,
  ERROR,
} from '../../constants';
import * as ActionTypes from '../../actionTypes';
import fetchServer from '../../lib/fetchServer';
import getRootPath from '../../lib/getRootPath';
import getSufficientState from '../../lib/getSufficientState';

const REQUEST_RETRY_TIMEOUT = 60 * 1000; // 1 min

const composeSyncRequest = (store) => {
  return ({
    type: SYNC,
    action: 'update',
    method: 'PATCH',
    params: {
      state: getSufficientState(store.getState()),
      client_timestamp: Date.now(),
      short_id: store.getState().get('server').get('shortId'),
    },
  });
};

const composeDestroySpreadsheetRequest = (store) => {
  const shortId = store.getState().get('server').get('shortId');

  return ({
    type: DESTROY_SPREADSHEET,
    action: 'destroy',
    method: 'DELETE',
    params: {
      short_id: shortId,
    },
  });
};

const sendRequest = (request) => {
  let responsePromise;
  responsePromise = fetchServer(
    request.method,
    request.action,
    request.params
  );

  return responsePromise;
};


const handleRequest = (store, request) => {
  sendRequest(request).then(
    (response) => {
      handleResponse(
        store,
        request,
        response
      );
    }
  );
};

const handleResponse = (store, request, response) => {
  if (response.errors) {
    setTimeout(() => store.dispatch({
      ...makeServerRequest(),
      meta: { throttle: true },
    }), REQUEST_RETRY_TIMEOUT);

    store.dispatch(setRequestFailed(true));
  } else if (response.data) {
    if (response.data.status === ERROR) {
      store.dispatch(setRequestFailed(true));
    } else {
      store.dispatch(setRequestFailed(false));

      if (request.type === DESTROY_SPREADSHEET) {
        store.dispatch(closeDialog());
        store.dispatch(push(getRootPath()));
      }
    }
  }
};

export default store => next => action => {
  if (action.type !== ActionTypes.MAKE_SERVER_REQUEST) {
    return next(action);
  }

  switch (action.requestType) {
    case SYNC: {
      const request = composeSyncRequest(store);
      handleRequest(store, request);

      break;
    }

    case DESTROY_SPREADSHEET: {
      const request = composeDestroySpreadsheetRequest(store);
      handleRequest(store, request);

      break;
    }

    default:

  }

  return next(action);
};

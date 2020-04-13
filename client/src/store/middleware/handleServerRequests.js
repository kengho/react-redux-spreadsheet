import { push } from 'connected-react-router';

import { closeDialog } from '../../actions/ui';
import {
  makeServerRequest,
  setRequestFailed,
  setSyncInProgress,
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
      // NOTE: serializing data here for rails not to parse json while updating.
      state: JSON.stringify(getSufficientState(store.getState())),
      client_timestamp: Date.now(),
      short_id: store.getState().server.shortId,
    },
  });
};

const composeDestroySpreadsheetRequest = (store) => {
  const shortId = store.getState().server.shortId;

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
  store.dispatch(setSyncInProgress(true));

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
  let success = false;

  if (!response.errors && response.data && (response.data.status !== ERROR)) {
    success = true;

    if (request.type === DESTROY_SPREADSHEET) {
      store.dispatch(closeDialog());
      store.dispatch(push(getRootPath()));
    }
  }

  if (success) {
    store.dispatch(setRequestFailed(false));
  } else {
    setTimeout(() => store.dispatch({
      ...makeServerRequest(SYNC),
      meta: { throttle: true },
    }), REQUEST_RETRY_TIMEOUT);
    store.dispatch(setRequestFailed(true));
  }

  store.dispatch(setSyncInProgress(false));
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

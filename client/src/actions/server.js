import * as ActionTypes from '../actionTypes';

export function setShortId(shortId) {
  return {
    type: ActionTypes.SET_SHORT_ID,
    shortId,
  };
}

export function setSync(sync) {
  return {
    type: ActionTypes.SET_SYNC,
    sync,
  };
}

export function makeServerRequest(requestType) { // serverRequestTypes
  return {
    type: ActionTypes.MAKE_SERVER_REQUEST,
    requestType,
  };
}

export function setRequestFailed(requestFailed) {
  return {
    type: ActionTypes.SET_REQUEST_FAILED,
    requestFailed,
  };
}

import * as ActionTypes from '../actionTypes';

const branch = 'server';

export function setShortId(shortId) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_SHORT_ID,
    branch,
    updater: (state) => state.shortId = shortId,
  };
}

export function setSync(sync) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_SYNC,
    branch,
    updater: (state) => state.sync = sync,
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
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_REQUEST_FAILED,
    branch,
    updater: (state) => state.requestFailed = requestFailed,
  };
}

export function setSyncInProgress(syncInProgress) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_SYNC_IN_PROGRESS,
    branch,
    updater: (state) => state.syncInProgress = syncInProgress,
  };
}

export function setErrors(errors) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_ERRORS,
    branch,
    updater: (state) => state.errors = errors,
  };
}

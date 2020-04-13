import * as ActionTypes from '../actionTypes';

// changesData should be true for import and false for initial data load.
export function mergeServerState(serverState, changesData = false) {
  return {
    type: ActionTypes.MERGE_SERVER_STATE,
    serverState,
    changesData,
  };
}

// NOTE: convention: "updater" should be one-liner.
export function update(branch, updater) {
  return {
    type: ActionTypes.UPDATE,
    branch,
    updater,
  };
}

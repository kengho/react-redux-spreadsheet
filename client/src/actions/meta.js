// TODO: meta should represent actions that affects
//   many state branches, not just another branch.

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

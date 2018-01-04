// TODO: meta should represent actions that affects
//   many state branches, not just another branch.

import * as ActionTypes from '../actionTypes';

export function setShortId(shortId) { // eslint-disable-line import/prefer-default-export
  return {
    type: ActionTypes.SET_SHORT_ID,
    shortId,
  };
}

import * as ActionTypes from '../actionTypes';

export function setShortId(shortId) { // eslint-disable-line import/prefer-default-export
  return {
    type: ActionTypes.SET_SHORT_ID,
    shortId,
  };
}

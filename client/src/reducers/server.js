import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default (state = initialState().get('server') || fromJS({}), action) => {
  switch (action.type) {
    case ActionTypes.SET_SHORT_ID:
      return state.set('shortId', action.shortId);

    case ActionTypes.SET_SYNC:
      return state.set('sync', action.sync);

    case ActionTypes.SET_REQUEST_FAILED:
      return state.set('requestFailed', action.requestFailed);

    case ActionTypes.MAKE_SERVER_REQUEST:
      return state;

    case ActionTypes.MERGE_SERVER_STATE:
      return state.set('requestFailed', false);

    default:
      return state;
  }
};

import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default (state = initialState().get('settings') || null, action) => {
  switch (action.type) {
    case ActionTypes.MERGE_SERVER_STATE:
      return state.mergeDeep(fromJS(action.serverState.settings));

    case ActionTypes.SET_SETTINGS:
      return fromJS(action.settings)

    default:
      return state;
  }
};

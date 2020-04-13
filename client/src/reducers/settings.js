import produce from 'immer';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default (state = initialState().settings, action) => produce(state, draft => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case ActionTypes.SET_SETTINGS: {
      Object.keys(action.settings).forEach((item) => draft[item] = action.settings[item]);
      break;
    }

    case ActionTypes.MERGE_SERVER_STATE:
      return action.serverState.settings;
  }
});

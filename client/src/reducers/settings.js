import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

const defaultState = fromJS({
  autoSaveHistory: true,
  hasHeader: false,
});

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.SET_SETTINGS_FROM_JSON: {
      return fromJS(JSON.parse(action.settingsJSON));
    }

    case ActionTypes.SET_SETTINGS_PARAM: {
      return state.set(action.param, action.value);
    }

    default:
      return state;
  }
}

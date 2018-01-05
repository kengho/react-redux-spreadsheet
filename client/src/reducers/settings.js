import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default function settings(state = initialState().get('settings'), action) {
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

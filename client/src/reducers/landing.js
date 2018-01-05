import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default function landing(state = initialState().get('landing'), action) {
  switch (action.type) {
    case ActionTypes.SET_LANDING_MESSAGES:
      return state.set(
        'messages',
        fromJS(action.messages)
      );

    case ActionTypes.DISABLE_LANDING_BUTTON:
      return state.set(
        'buttonIsDisabled',
        action.disable
      );

    default:
      return state;
  }
}

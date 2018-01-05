import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

const defaultState = fromJS({
  messages: [],
  buttonIsDisabled: false,
});

export default function meta(state = defaultState, action) {
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

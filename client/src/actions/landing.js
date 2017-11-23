import * as ActionTypes from '../actionTypes';

export function setLandingMessages(messages) {
  return {
    type: ActionTypes.SET_LANDING_MESSAGES,
    messages,
  };
}

export function disableLandingButton(disable) {
  return {
    type: ActionTypes.DISABLE_LANDING_BUTTON,
    disable,
  };
}

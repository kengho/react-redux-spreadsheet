import * as ActionTypes from '../actionTypes';

export function setLandingMessages(messages) {
  return {
    type: ActionTypes.SET_LANDING_MESSAGES,
    messages,
  };
}

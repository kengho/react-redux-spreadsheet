import * as ActionTypes from '../actionTypes';

export function setSettings(settings) {
  return {
    type: ActionTypes.SET_SETTINGS,
    settings,
  };
}

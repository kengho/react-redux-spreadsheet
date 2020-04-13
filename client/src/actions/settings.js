import * as ActionTypes from '../actionTypes';

export function setSettings(settings) {
  return {
    type: ActionTypes.SET_SETTINGS,
    changesData: true, // test_1156
    settings,
  };
}

import * as ActionTypes from '../actionTypes';

// changesData should be true for import and false for initial data load.
export function setSettingsFromJSON(settingsJSON, changesData = false) {
  return {
    type: ActionTypes.SET_SETTINGS_FROM_JSON,
    settingsJSON,
    changesData,
  };
}

export function setSettingsParam(param, value, changesData = false) {
  return {
    type: ActionTypes.SET_SETTINGS_PARAM,
    changesData: true,
    param,
    value,
  };
}

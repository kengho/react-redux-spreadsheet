import * as ActionTypes from '../actionTypes';

export function openUi(kind, params) {
  return {
    type: ActionTypes.OPEN_UI,
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
    kind,
    params,
  };
}

export function closeUi() {
  return {
    type: ActionTypes.CLOSE_UI,
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
  };
}

export function disableNewSpreadsheetButton(disable) {
  return {
    type: ActionTypes.DISABLE_NEW_SPREADSHEET_BUTTON,
    disable,
  };
}

export function setNewSpreadsheetPath(newSpreadsheetPath) {
  return {
    type: ActionTypes.SET_NEW_SPREADSHEET_PATH,
    newSpreadsheetPath,
  };
}

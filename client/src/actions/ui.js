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

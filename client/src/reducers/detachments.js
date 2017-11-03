import { fromJS } from 'immutable';

const defaultState = fromJS({
  currentCellValue: null,
});

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case 'DETACHMENTS/SET_CURRENT_CELL_VALUE':
      return state.set(
        'currentCellValue',
        action.currentCellValue
      );

    default:
      return state;
  }
}

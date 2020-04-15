import * as ActionTypes from '../../actionTypes';
import {
  insertRows,
  insertColumns,
  setProp,
} from '../../actions/table';
import { ROW, COLUMN } from '../../constants';

// test_845
// NOTE: this happens at all click hanadlers, so it's decided to move code here.
export default store => next => action => {
  const getAdditionalActions = (store, action) => {
    const currentPointer = store.getState().table.present.major.session.pointer;
    const currentPointerEdit = currentPointer.edit;

    let nextPointerEdit;
    if (action.pointerProps.edit === undefined) {
      nextPointerEdit = currentPointerEdit;
    } else {
      nextPointerEdit = action.pointerProps.edit;
    }

    if (currentPointerEdit && !nextPointerEdit) {
      const rowIndex = currentPointer[ROW].index;
      const columnIndex = currentPointer[COLUMN].index;
      let currentPointedCellValue;
      try {
        currentPointedCellValue = store.getState().table.present.major
          .layout[ROW]
          .list[rowIndex]
          .cells[columnIndex]
          .value;
      } catch (e) {
        currentPointedCellValue = '';
      }
      const nextPointedCellValue = currentPointer.value || '';

      // test_241
      if (nextPointedCellValue !== currentPointedCellValue) {
        return [
          insertRows({ index: rowIndex }),
          insertColumns({ index: columnIndex }),
          setProp({
            ...currentPointer,
            prop: 'value',
          }),
        ];
      }
    }
  };

  if (action.type === ActionTypes.VENDOR_BATCH_ACTIONS) {
    action.payload.forEach((batchedAction) => {
      if (batchedAction.type === ActionTypes.SET_POINTER_PROPS) {
        const additionalActions = getAdditionalActions(store, batchedAction);
        if (additionalActions) {
          action.payload.push(...additionalActions);
        }
      }
    });
  }

  if (action.type === ActionTypes.SET_POINTER_PROPS) {
    // NOTE: seems line this branch isn't using anywhere.
    const additionalActions = getAdditionalActions(store, action);
    if (additionalActions) {
      additionalActions.forEach((additionalAction) => {
        store.dispatch(additionalAction);
      })
    }
  }

  return next(action);
};

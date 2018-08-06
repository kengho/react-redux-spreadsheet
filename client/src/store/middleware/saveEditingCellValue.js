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
    const currentPointer = store.getState().get('table').present.getIn(['major', 'session', 'pointer']);
    const currentPointerEdit = currentPointer.get('edit');
    const nextPointerEdit = (action.pointer.edit !== undefined) ? action.pointer.edit : currentPointerEdit;
    const rowIndex = currentPointer.getIn([ROW, 'index']);
    const columnIndex = currentPointer.getIn([COLUMN, 'index']);
    if (currentPointerEdit && !nextPointerEdit) {
      const currentPointedCellValue = store.getState().get('table').present.getIn(
        [
          'major',
          'layout',
          ROW,
          'list',
          rowIndex,
          'cells',
          columnIndex,
          'value',
        ],
        ''
      );
      const nextPointedCellValue = currentPointer.get('value', '');

      // test_241
      if (nextPointedCellValue !== currentPointedCellValue) {
        return [
          insertRows({ index: rowIndex }),
          insertColumns({ index: columnIndex }),
          setProp({
            ...currentPointer.toJS(),
            prop: 'value',
          }),
        ];
      }
    }
  };

  if (action.type === ActionTypes.VENDOR_BATCH_ACTIONS) {
    action.payload.forEach((batchedAction) => {
      if (batchedAction.type === ActionTypes.SET_POINTER) {
        const additionalActions = getAdditionalActions(store, batchedAction);
        if (additionalActions) {
          action.payload.push(...additionalActions);
        }
      }
    });
  }

  if (action.type === ActionTypes.SET_POINTER) {
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

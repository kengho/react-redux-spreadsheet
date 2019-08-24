import { pushCellHistory } from '../../actions/table';
import { ROW, COLUMN } from '../../constants';
import * as ActionTypes from '../../actionTypes';

export default store => next => action => {
  // REVIEW: should setting autoSaveHistory to false clear all cells' history?
  const autoSaveHistory = store.getState().getIn(['settings', 'autoSaveHistory']);
  if (!autoSaveHistory) {
    return next(action);
  }

  const getAdditionalAction = (store, action) => {
    if (action.cell.prop !== 'value') {
      return;
    }

    const rowIndex = action.cell[ROW].index;
    const columnIndex = action.cell[COLUMN].index;
    const historyValue = store.getState().get('table').present.getIn(
      ['major', 'layout', ROW, 'list', rowIndex, 'cells', columnIndex, 'value']
    );

    // REVIEW: should we filter empty value?
    //   It allows you to know when cell was first filled, but it's not that much.
    // NOTE: we don't test that value changes in reducer bacause it makes no sense,
    //   and not before dispatching actions because it's easier to do it once here
    //   than N times there. In terms of performance, we rely on the assumption that
    //   users will change values more frequently than just leaving them as is.
    if (action.cell.value !== historyValue) {
      const time = Date.now();
      return pushCellHistory(action.cell, time, historyValue);
    }
  };

  // NOTE: see VERY IMPORTANT NOTE in configureStore().
  if (action.type === ActionTypes.VENDOR_BATCH_ACTIONS) {
    action.payload.forEach((batchedAction) => {
      if (batchedAction.type === ActionTypes.SET_PROP) {
        const additionalAction = getAdditionalAction(store, batchedAction);
        if (additionalAction) {
          action.payload.push(additionalAction);
        }
      }
    });
  }

  if (action.type === ActionTypes.SET_PROP) {
    const additionalAction = getAdditionalAction(store, action);
    if (additionalAction) {
      store.dispatch(additionalAction);
    }
  }

  return next(action);
};

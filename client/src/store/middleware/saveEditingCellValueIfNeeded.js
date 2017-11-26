import * as ActionTypes from '../../actionTypes';
import { setProp } from '../../actions/table';

// Saving previously edited cells' value via detachments.
//   It should be done in middleware because DataCell doesn't know
//   about previous pointer if user clicks on another DataCell.
const saveEditingCellValueIfNeeded = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== ActionTypes.SAVE_EDITING_CELL_VALUE_IF_NEEDED) {
    return next(action);
  }

  const table = store.getState().get('table').present;
  const pointerCellId = table.getIn(['session', 'pointer', 'cellId']);
  if (!pointerCellId) {
    return next(action);
  }

  const pointedCellNextValue = store.getState().getIn(['detachments', 'currentCellValue']);
  if (!pointedCellNextValue) {
    return next(action);
  }

  let pointedCellPreviousValue;
  const pointedCell = table.getIn(['data', 'cells', pointerCellId]);
  if (pointedCell) {
    pointedCellPreviousValue = pointedCell.get('value');
  }

  if (pointedCellNextValue !== pointedCellPreviousValue) {
    store.dispatch(
      setProp(
        pointerCellId,
        'value',
        pointedCellNextValue
      )
    );
  }

  return next(action);
};

export default saveEditingCellValueIfNeeded;

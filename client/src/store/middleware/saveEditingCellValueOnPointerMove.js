import { tableSetProp } from '../../actions/table';
import { detachmentsSetCurrentCellValue } from '../../actions/detachments';

const saveEditingCellValueOnPointerMove = store => next => action => { // eslint-disable-line consistent-return
  // Saving previously edited cells' value via detachments.
  //   It should be done in middleware because DataCell doesn't know
  //   about previous pointer if user clicks on another DataCell.
  //   If user presses keydown - it knows, but for our convenience DataCell's
  //   keyDownHandler also doesn't changes cells' values until this middleware is present.
  //
  //   Only TABLE/SET_POINTER or TABLE/MOVE_POINTER may trigger value changing.
  if (!(action.type === 'TABLE/SET_POINTER' || action.type === 'TABLE/MOVE_POINTER')) {
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
      tableSetProp(
        pointerCellId,
        'value',
        pointedCellNextValue
      )
    );

    // Clear currentCellValue so this middleware won't run again after
    // after several consecutive pointer changes without any text typing.
    store.dispatch(detachmentsSetCurrentCellValue(null));
  }

  return next(action);
};

export default saveEditingCellValueOnPointerMove;

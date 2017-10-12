import { tableSetProp } from '../../actions/table';

const saveEditingCellValueOnPointerMove = store => next => action => { // eslint-disable-line consistent-return
  // HACK: saving previously edited cells' value.
  //   It should be done in middleware because DataCell doesn't know
  //   about previous pointer if user clicks on another DataCell.
  //   If user presses keydown - it knows, but for our convenience DataCell's
  //   keyDownHandler also doesn't changes cells' values until this hack is present.
  //
  //   Possible ways of getting rid of this:
  //   1) Store current cells' value in store.
  //   Issue: state changing fires a lot of events, potentially slowing down the app.
  //   2) Store current cells' value somewhere else.
  //   Issue: not any better than current implementation.
  //   3) Pass previous pointer to every DataCell.
  //   Issue: to complex and, again, slow.
  //
  //   Only TABLE/SET_POINTER or TABLE/MOVE_POINTER may trigger value changing.
  if (action.type === 'TABLE/SET_POINTER' || action.type === 'TABLE/MOVE_POINTER') {
    const previousTable = store.getState().get('table').present;
    const previousPointerCellId = previousTable.getIn(['session', 'pointer', 'cellId']);

    if (previousPointerCellId) {
      let previousPointerCellNextValue;
      const probablyPreviousPointerCell = document
        .getElementById(previousPointerCellId);
      if (probablyPreviousPointerCell) {
        const previousPointerCellTextarea = probablyPreviousPointerCell
          .querySelector('textarea');
        if (previousPointerCellTextarea) {
          previousPointerCellNextValue = previousPointerCellTextarea.value;
        }
      }

      const previousPointerCell = previousTable
        .getIn(['data', 'cells'])
        .get(previousPointerCellId);
      let previousPointerCellPreviousValue;
      if (previousPointerCell) {
        previousPointerCellPreviousValue = previousPointerCell.get('value');
      }

      // Normalizing values (empty to undefined).
      if (previousPointerCellPreviousValue === '') {
        previousPointerCellPreviousValue = undefined;
      }
      if (previousPointerCellNextValue === '') {
        previousPointerCellNextValue = undefined;
      }

      if (previousPointerCellNextValue !== previousPointerCellPreviousValue) {
        store.dispatch(
          tableSetProp(
            previousPointerCellId,
            'value',
            previousPointerCellNextValue
          )
        );
      }
    }
  }

  return next(action);
};

export default saveEditingCellValueOnPointerMove;

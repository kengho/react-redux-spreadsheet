import {
  getColumnId,
  getRowId,
} from '../../core';
import {
  expand,
  setProp,
} from '../../actions/table';

const handlePointerChanges = store => next => action => { // eslint-disable-line consistent-return
  if (!action.type.match('POINTER')) {
    return next(action);
  }

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
  //   Only SET_POINTER or MOVE_POINTER may trigger value changing.
  if (action.type === 'SET_POINTER' || action.type === 'MOVE_POINTER') {
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
          setProp(
            previousPointerCellId,
            'value',
            previousPointerCellNextValue
          )
        );
      }
    }
  }

  const nextAction = next(action);

  // Expands table if pointer moves beyond it.
  // Only MOVE_POINTER may trigger expand.
  if (action.type === 'MOVE_POINTER') {
    const nextTable = store.getState().get('table').present;
    const nextRows = nextTable.getIn(['data', 'rows']).toJS();
    const nextColumns = nextTable.getIn(['data', 'columns']).toJS();
    const nextPointerCellId = nextTable.getIn(['session', 'pointer', 'cellId']);
    const nextPointerRowId = getRowId(nextPointerCellId);
    const nextPointerColumnId = getColumnId(nextPointerCellId);

    if (nextRows.findIndex((row) => row.id === nextPointerRowId) === -1) {
      // slice deletes 'r' and 'c' prefixes from ids, because expand() adds them by itself.
      store.dispatch(expand([nextRows.length, -1], nextPointerRowId.slice(1)));
    } else if (nextColumns.findIndex((column) => column.id === nextPointerColumnId) === -1) {
      store.dispatch(expand([-1, nextColumns.length, -1], nextPointerColumnId.slice(1)));
    }
  }

  return nextAction;
};

export default handlePointerChanges;

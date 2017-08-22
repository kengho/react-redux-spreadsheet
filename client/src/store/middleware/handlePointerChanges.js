import {
  getColumnId,
  getRowId,
} from '../../core';
import { expand } from '../../actions/table';

// Expands table if pointer moves beyond it.
const handlePointerChanges = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== 'MOVE_POINTER') {
    return next(action);
  }

  const nextAction = next(action);

  const nextTable = store.getState().get('table').present;
  const nextRows = nextTable.getIn(['data', 'rows']);
  const nextColumns = nextTable.getIn(['data', 'columns']);
  const nextPointerCellId = nextTable.getIn(['session', 'pointer', 'cellId']);
  const nextPointerRowId = getRowId(nextPointerCellId);
  const nextPointerColumnId = getColumnId(nextPointerCellId);

  if (nextRows.indexOf(nextPointerRowId) === -1) {
    // slice deletes 'r' and 'c' prefixes from ids, because expand() adds them by itself.
    store.dispatch(expand([nextRows.size, -1], nextPointerRowId.slice(1)));
  } else if (nextColumns.indexOf(nextPointerColumnId) === -1) {
    store.dispatch(expand([-1, nextColumns.size, -1], nextPointerColumnId.slice(1)));
  }

  return nextAction;
};

export default handlePointerChanges;

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

  const table = store.getState().get('table').present;
  const currentRows = table.getIn(['data', 'rows']);
  const currentColumns = table.getIn(['data', 'columns']);
  const pointerCellId = table.getIn(['session', 'pointer', 'cellId']);
  const pointerRowId = getRowId(pointerCellId);
  const pointerColumnId = getColumnId(pointerCellId);

  if (currentRows.indexOf(pointerRowId) === -1) {
    // slice deletes 'r' and 'c' prefixes from ids, because expand() adds them by itself.
    store.dispatch(expand([currentRows.size, -1], pointerRowId.slice(1)));
  } else if (currentColumns.indexOf(pointerColumnId) === -1) {
    store.dispatch(expand([-1, currentColumns.size, -1], pointerColumnId.slice(1)));
  }

  return nextAction;
};

export default handlePointerChanges;

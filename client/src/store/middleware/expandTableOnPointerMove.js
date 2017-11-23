import {
  getColumnId,
  getRowId,
} from '../../core';
import * as ActionTypes from '../../actionTypes';
import { addLine } from '../../actions/table';

// Expands table if pointer moves beyond it.
const expandTableOnPointerMove = store => next => action => { // eslint-disable-line consistent-return
  const nextAction = next(action);

  if (action.type !== ActionTypes.MOVE_POINTER) {
    return nextAction;
  }

  const nextTable = store.getState().get('table').present;
  const nextRows = nextTable.getIn(['data', 'rows']);
  const nextColumns = nextTable.getIn(['data', 'columns']);
  const nextPointerCellId = nextTable.getIn(['session', 'pointer', 'cellId']);
  const nextPointerRowId = getRowId(nextPointerCellId);
  const nextPointerColumnId = getColumnId(nextPointerCellId);

  if (nextRows.findIndex((row) => row.get('id') === nextPointerRowId) === -1) {
    // slice deletes 'r' and 'c' prefixes from ids, because addLine() adds them by itself.
    store.dispatch(addLine(nextRows.size, 'ROW', nextPointerRowId.slice('r'.length)));
  } else if (nextColumns.findIndex((column) => column.get('id') === nextPointerColumnId) === -1) {
    store.dispatch(addLine(nextColumns.size, 'COLUMN', nextPointerColumnId.slice('c'.length)));
  }

  return nextAction;
};

export default expandTableOnPointerMove;

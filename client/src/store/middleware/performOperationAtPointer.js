import { fromJS } from 'immutable';

import {
  CLEAR,
  COLUMN,
  COPY,
  CUT,
  DELETE,
  PASTE,
  ROW,
} from '../../constants';
import {
  insertColumns,
  insertRows,
  setCell,
  setClipboard,
  setProp,
} from '../../actions/table';
import * as ActionTypes from '../../actionTypes';

// NOTE: this action handles in middleware for sake of DRY.
//   It calls by ContextMenu and by hotkeys, so we don't want
//   to mess things in one place while changing code in another.
export default store => next => action => {
  if (action.type !== ActionTypes.PERFORM_OPERATION_AT_POINTER) {
    return next(action);
  }

  const table = store.getState().get('table').present.get('major');
  const pointer = table.getIn(['session', 'pointer']);
  const pointerRowIndex = pointer.getIn([ROW, 'index']);
  const pointerColumnIndex = pointer.getIn([COLUMN, 'index']);

  if (action.operation === COPY || action.operation === CUT) {
    let cell = table.getIn(['layout', ROW, 'list', pointerRowIndex, 'cells', pointerColumnIndex]);
    const cellExists = Boolean(cell);
    if (!cell) {
      cell = fromJS({});
    }

    const clipboardRange = {
      [ROW]: {
        index: pointerRowIndex,
        length: 1,
      },
      [COLUMN]: {
        index: pointerColumnIndex,
        length: 1,
      },
    };
    store.dispatch(setClipboard({ ...clipboardRange, cells: [[cell.toJS()]] }));

    // TODO: create getPosition function which will return only indexes from
    //   cell/pointer, etc. and user it everywhere.
    if (cellExists && action.operation === CUT) {
      // Clear cell immediately.
      store.dispatch(setCell({
        [ROW]: {
          index: pointerRowIndex,
        },
        [COLUMN]: {
          index: pointerColumnIndex,
        },
      }));
    }
  }

  if (action.operation === PASTE) {
    const clipboard = table.getIn(['session', 'clipboard']);

    // NOTE: app's clipboard have priority over system's.
    let value;
    if (clipboard.get('cells')) {
      value = clipboard.getIn(['cells', 0, 0, 'value'], '');
    } else if (action.text) {
      value = action.text;
    }

    // TODO: spread tabbed text through nearby cells (like Calc).
    if (value && value.length > 0) {
      store.dispatch(insertRows({ index: pointerRowIndex }));
      store.dispatch(insertColumns({ index: pointerColumnIndex }));
      store.dispatch(setCell({
        [ROW]: {
          index: pointerRowIndex,
        },
        [COLUMN]: {
          index: pointerColumnIndex,
        },
        value,
      }));
    }
  }

  if (action.operation === CLEAR) {
    store.dispatch(setProp({
      [ROW]: {
        index: pointerRowIndex,
      },
      [COLUMN]: {
        index: pointerColumnIndex,
      },
      prop: 'value',
      value: undefined,
    }));
  }

  // TODO: show confirmation dialog and proceed.
  if (action.operation === DELETE) {
    // store.dispatch(setCell({
    //   [ROW]: {
    //     index: pointerRowIndex,
    //   },
    //   [COLUMN]: {
    //     index: pointerColumnIndex,
    //   },
    // }));
  }

  return next(action);
};

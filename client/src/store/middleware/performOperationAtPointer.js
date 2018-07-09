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
  batchActions,
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
    let tabSplit;
    if (clipboard.get('cells')) {
      value = clipboard.getIn(['cells', 0, 0, 'value'], '');
    } else if (action.text) {
      value = action.text;
      tabSplit = value.split('\t');
    }

    // NOTE: PERF: splitted text without batchActions: ~350ms. With batchActions: ~100ms.
    // console.time('performOperationAtPointer paste');
    const actionsToBatch = [];
    if (value && value.length > 0) {
      if (tabSplit && tabSplit.length > 1) {
        const nextLeastColumnIndex = pointerColumnIndex + tabSplit.length - 1;
        actionsToBatch.push(insertRows({ index: pointerRowIndex }));
        actionsToBatch.push(insertColumns({ index: nextLeastColumnIndex }));
        tabSplit.forEach((value, i) => {
          const currentPointerColumnIndex = pointerColumnIndex + i;
          actionsToBatch.push(setCell({
            [ROW]: {
              index: pointerRowIndex,
            },
            [COLUMN]: {
              index: currentPointerColumnIndex,
            },
            value,
          }))
        });
      } else {
        actionsToBatch.push(
          insertRows({ index: pointerRowIndex }),
          insertColumns({ index: pointerColumnIndex }),
          setCell({
            [ROW]: {
              index: pointerRowIndex,
            },
            [COLUMN]: {
              index: pointerColumnIndex,
            },
            value,
          })
        );
      }

      store.dispatch(batchActions(actionsToBatch));
    }
    // console.timeEnd('performOperationAtPointer paste');
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

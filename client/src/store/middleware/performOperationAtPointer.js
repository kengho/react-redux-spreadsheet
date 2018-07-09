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
    if (clipboard.get('cells')) {
      value = clipboard.getIn(['cells', 0, 0, 'value'], '');
    } else if (action.text) {
      value = action.text;
    }

    // NOTE: PERF: splitted text without batchActions: ~350ms. With batchActions: ~100ms.
    // console.time('performOperationAtPointer paste');
    const actionsToBatch = [];
    if (value && value.length > 0) {
      if (action.text) {
        // NOTE: inserting "\t" and "\n" splitted text as array.
        //   Test text1:
        //     1	2	3
        //     4	5
        //     6	7	8	9
        //   Test text2:
        //     1	2	3
        const newlineSplit = value.split('\n');

        const nextLeastRowIndex = pointerRowIndex + newlineSplit.length - 1;
        actionsToBatch.push(insertRows({ index: nextLeastRowIndex }));

        let maxNextLeastColumnIndex = -1;
        newlineSplit.forEach((line, lineIndex) => {
          const currentRowIndex = pointerRowIndex + lineIndex;
          const tabSplit = line.split('\t');
          const nextLeastColumnIndex = pointerColumnIndex + tabSplit.length - 1;

          // Insert columns if only they wasn't inserted before.
          if (nextLeastColumnIndex > maxNextLeastColumnIndex) {
            // NOTE: this doesn't break grouping for undo-redo (client/src/reducers/index.js)
            //   because inserting lines is filtered there for it considered not changing date.
            actionsToBatch.push(insertColumns({ index: nextLeastColumnIndex }));
            maxNextLeastColumnIndex = nextLeastColumnIndex;
          }

          tabSplit.forEach((value, columnIndex) => {
            const currentColumnIndex = pointerColumnIndex + columnIndex;
            actionsToBatch.push(setProp({
              [ROW]: {
                index: currentRowIndex,
              },
              [COLUMN]: {
                index: currentColumnIndex,
              },
              prop: 'value',
              value,
            }))
          });
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

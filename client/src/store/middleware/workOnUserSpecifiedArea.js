import copyToClipboard from 'copy-to-clipboard';

import {
  CLEAR,
  COLUMN,
  COPY,
  CUT,
  DELETE,
  PASTE,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import {
  batchActions,
  clearSelection,
  insertColumns,
  insertRows,
  setClipboard,
  setProp,
} from '../../actions/table';
import * as ActionTypes from '../../actionTypes';

// NOTE: this action handles in middleware for sake of DRY.
//   It calls by ContextMenu and by hotkeys, so we don't want
//   to mess things in one place while changing code in another.
// TODO: test properly somehow.
export default store => next => action => {
  if (action.type !== ActionTypes.WORK_ON_USER_SPECIFIED_AREA) {
    return next(action);
  }

  // NOTE: PERF: splitted text without batchActions: ~350ms...Infinity (depends on selection size).
  //   With batchActions: ~165ms.
  // NOTE: PERF: with setArea() action (you'll find it in the git): ~100ms (after pasting test text 1 several times to cell A1).
  //   With separate setProp(): ~5ms with pasting in the same place and ~100ms when pating to random place.
  // console.time('workOnUserSpecifiedArea');
  const actionsToBatch = [];

  const table = store.getState().table.present.major;
  const pointer = table.session.pointer;
  const selection = table.session.selection[0];
  const thereIsSelection =
    selection.boundary[ROW] &&
    selection.boundary[COLUMN];

  if (action.operation === COPY || action.operation === CUT || action.operation === CLEAR) {
    let clipboardBoundary;
    if (thereIsSelection) {
      clipboardBoundary = selection.boundary;
      actionsToBatch.push(clearSelection());
    } else { // use pointer as one-celled selection
      clipboardBoundary = {
        [ROW]: {
          [BEGIN]: {
            index: pointer[ROW].index,
          },
          [END]: {
            index: pointer[ROW].index,
          },
        },
        [COLUMN]: {
          [BEGIN]: {
            index: pointer[COLUMN].index,
          },
          [END]: {
            index: pointer[COLUMN].index,
          },
        },
      };
    }

    if (action.operation === COPY || action.operation === CUT) {
      const clipboardedRows = [];
      for (
        let rowIndex = clipboardBoundary[ROW][BEGIN].index;
        rowIndex <= clipboardBoundary[ROW][END].index;
        rowIndex += 1
      ) {
        let clipboardedRow;
        try {
          // NOTE: removing cells from row.
          Object.assign(clipboardedRow, table.layout[ROW].list[rowIndex]);
        } catch (e) {
          clipboardedRow = {};
        }
        clipboardedRow.cells = [];
        for (
          let columnIndex = clipboardBoundary[COLUMN][BEGIN].index;
          columnIndex <= clipboardBoundary[COLUMN][END].index;
          columnIndex += 1
        ) {
          let cellInClipboard;
          try {
            cellInClipboard = table.layout[ROW].list[rowIndex].cells[columnIndex] || {};
          } catch (e) {
            cellInClipboard = {};
          }
          clipboardedRow.cells.push(cellInClipboard);
        }

        clipboardedRows.push(clipboardedRow);
      }

      actionsToBatch.push(setClipboard({
        boundary: clipboardBoundary,
        rows: clipboardedRows,
      }));

      // Copy to real clipboard.
      // NOTE: placed here bacause middleware does't work correctly with
      //   batchActions and should be adjusted, and this action happens only
      //   once and it is probably waste of code in this case.
      const plainTableArray = clipboardedRows.map(
        (row) => row.cells.map(
          (cell) => cell.value || '').join('\t')
        );
      if (process.env.NODE_ENV !== 'test') {
        copyToClipboard(plainTableArray.join('\n'));
      }
    }

    // test_992
    if (action.operation === CUT || action.operation === CLEAR) {
      for (
        let rowIndex = clipboardBoundary[ROW][BEGIN].index;
        rowIndex <= clipboardBoundary[ROW][END].index;
        rowIndex += 1
      ) {
        for (
          let columnIndex = clipboardBoundary[COLUMN][BEGIN].index;
          columnIndex <= clipboardBoundary[COLUMN][END].index;
          columnIndex += 1
        ) {
          actionsToBatch.push(setProp({
            [ROW]: {
              index: rowIndex,
            },
            [COLUMN]: {
              index: columnIndex,
            },
            prop: 'value',
            value: undefined,
          }));
        }
      }
    }
  }

  if (action.operation === PASTE) {
    const clipboard = table.session.clipboard[0];
    const thereIsClipboard =
      clipboard.boundary[ROW] &&
      clipboard.boundary[COLUMN];

    const anchorCell = {
      [ROW]: {
        index: pointer[ROW].index,
      },
      [COLUMN]: {
        index: pointer[COLUMN].index,
      },
    };

    // NOTE: app's clipboard have priority over system's.
    let textSplit = [[]];
    if (thereIsClipboard) {
      // REVIEW: PERF: this is probably ineficient, to measure.
      // NOTE: relying on the fact that clipboard is already rectangular
      //   which should be true because it comes from table itself.
      textSplit = clipboard.rows.map((row) => row.cells.map((cell) => cell.value));
    } else if (action.text) {
      // NOTE: inserting "\t" and "\n" splitted text as array.
      const value = action.text;
      textSplit = value.split('\n').map((row) => row.split('\t'));
    } else {
      // REVIEW: then what? Should we care?
    }

    const setPropActions = [];
    textSplit.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        setPropActions.push(
          setProp({
            [ROW]: {
              index: anchorCell[ROW].index + rowIndex,
            },
            [COLUMN]: {
              index: anchorCell[COLUMN].index + columnIndex,
            },
            prop: 'value',
            value,
          })
        );
      });
    });

    const areaHeight = textSplit.length;
    const areaWidth = textSplit[0].length;
    if (anchorCell && areaHeight > 0 && areaWidth > 0) {
      const areasExtraRowIndex = areaHeight - 1;
      const areasExtraColumnIndex = areaWidth - 1;
      const nextMaxRowIndexCandidate = anchorCell[ROW].index + areasExtraRowIndex;
      const nextMaxColumnIndexCandidate = anchorCell[COLUMN].index + areasExtraColumnIndex;

      actionsToBatch.push(
        insertRows({ index: nextMaxRowIndexCandidate }),
        insertColumns({ index: nextMaxColumnIndexCandidate }),

        // test_992
        ...setPropActions,
      );
    }
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

  store.dispatch(batchActions(actionsToBatch));
  // console.timeEnd('workOnUserSpecifiedArea');

  return next(action);
};

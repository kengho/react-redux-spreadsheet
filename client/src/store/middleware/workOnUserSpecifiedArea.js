import { fromJS, Map, List } from 'immutable';
import copy from 'copy-to-clipboard';

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
  deleteArea,
  setArea,
  setClipboard,
  setProp,
} from '../../actions/table';
import {
  composeLine,
} from '../../core';
import * as ActionTypes from '../../actionTypes';

// NOTE: this action handles in middleware for sake of DRY.
//   It calls by ContextMenu and by hotkeys, so we don't want
//   to mess things in one place while changing code in another.
// REVIEW: lib? Never heard of it.
export default store => next => action => {
  if (action.type !== ActionTypes.WORK_ON_USER_SPECIFIED_AREA) {
    return next(action);
  }

  // NOTE: PERF: splitted text without batchActions: ~350ms...Infinity (depends on selection size).
  //   With batchActions: ~165ms.
  // console.time('workOnUserSpecifiedArea');
  const actionsToBatch = [];

  const table = store.getState().get('table').present.get('major');
  const pointer = table.getIn(['session', 'pointer']);
  const selection = table.getIn(['session', 'selection', 0]);
  const thereIsSelection =
    selection.getIn(['boundary', ROW]) &&
    selection.getIn(['boundary', COLUMN]);

  if (action.operation === COPY || action.operation === CUT || action.operation === CLEAR) {
    let clipboardBoundary;
    if (thereIsSelection) {
      clipboardBoundary = selection.get('boundary');
      actionsToBatch.push(clearSelection());
    } else {
      clipboardBoundary = fromJS({
        [ROW]: {
          [BEGIN]: {
            index: pointer.getIn([ROW, 'index']),
          },
          [END]: {
            index: pointer.getIn([ROW, 'index']),
          },
        },
        [COLUMN]: {
          [BEGIN]: {
            index: pointer.getIn([COLUMN, 'index']),
          },
          [END]: {
            index: pointer.getIn([COLUMN, 'index']),
          },
        },
      });
    }

    if (action.operation === COPY || action.operation === CUT) {
      const clipboardedRows = table
        .getIn(['layout', ROW, 'list'])
        .slice(
          clipboardBoundary.getIn([ROW, BEGIN, 'index']),
          clipboardBoundary.getIn([ROW, END, 'index']) + 1
        ).map(
          (row) => row.update(
            'cells',
            (cells) => cells.slice(
              clipboardBoundary.getIn([COLUMN, BEGIN, 'index']),
              clipboardBoundary.getIn([COLUMN, END, 'index']) + 1
            )
          )
        );

      actionsToBatch.push(setClipboard(Map({
        boundary: clipboardBoundary,
        rows: clipboardedRows,
      })));

      // Copy to real clipboard.
      // NOTE: placed here bacause middleware does't work correctly with
      //   batchActions and should be adjusted, and this action happens only
      //   once and it is probably waste of code in this case.
      const plainTableArray = clipboardedRows
        .map((row) =>
          row.get('cells').map((cell) =>
            cell.get('value') || '').join('\t')
          );
      copy(plainTableArray.join('\n'));

      if (action.operation === CUT) {
        // Clear cell immediately.
        const slicedRowsNumber = clipboardedRows.size;
        const slicedColumnsNumber = clipboardedRows.getIn([0, 'cells']).size;
        actionsToBatch.push(deleteArea({
          [ROW]: {
            index: clipboardBoundary.getIn([ROW, BEGIN, 'index']),
            length: slicedRowsNumber,
          },
          [COLUMN]: {
            index: clipboardBoundary.getIn([COLUMN, BEGIN, 'index']),
            length: slicedColumnsNumber,
          },
        }));
      }
    }

    if (action.operation === CLEAR) {
      for (
        let rowIndex = clipboardBoundary.getIn([ROW, BEGIN, 'index']);
        rowIndex <= clipboardBoundary.getIn([ROW, END, 'index']);
        rowIndex += 1
      ) {
        for (
          let columnIndex = clipboardBoundary.getIn([COLUMN, BEGIN, 'index']);
          columnIndex <= clipboardBoundary.getIn([COLUMN, END, 'index']);
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
    const clipboard = table.getIn(['session', 'clipboard', 0]);
    const thereIsClipboard =
      clipboard.getIn(['boundary', ROW]) &&
      clipboard.getIn(['boundary', COLUMN]);

    const anchorCell = {
      [ROW]: {
        index: pointer.getIn([ROW, 'index']),
      },
      [COLUMN]: {
        index: pointer.getIn([COLUMN, 'index']),
      },
    };
    let area;

    // NOTE: app's clipboard have priority over system's.
    if (thereIsClipboard) {
      area = clipboard.get('rows');
    } else {
      if (action.text) {
        // NOTE: inserting "\t" and "\n" splitted text as array.
        //   Test text 1:
        //     1	2	3
        //     4	5
        //     6	7	8	9
        //   Test text 2:
        //     1	2	3

        const value = action.text;
        let maxSplitColumnsLength = -1;
        const textSplit = value.split('\n').map((line) => {
          const lineSplit = line.split('\t');
          if (lineSplit.length > maxSplitColumnsLength) {
            maxSplitColumnsLength = lineSplit.length;
          }

          return lineSplit;
        });

        // area = fromJS([]);
        area = List.of(...textSplit.map((cells) => {
          const cellsPadding = Array
            .from(Array(maxSplitColumnsLength - cells.length))
            .map(() => '');
          cells.push(...cellsPadding);
          return composeLine({
            lineType: ROW,
            cellsValues: cells,
          });
        }));
      }
    }

    if (anchorCell && area && area.size > 0) {
      actionsToBatch.push(setArea(anchorCell, area));
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

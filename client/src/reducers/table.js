import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

import * as ActionTypes from '../actionTypes';
import {
  calcNewPos,
  getCellId,
  getColumnId,
  getColumnNumber,
  getMaxPos,
  getRowId,
  getRowNumber,
  initialState,
} from '../core';

export default function table(state = initialState(0, 0).get('table'), action) {
  switch (action.type) {
    case ActionTypes.SET_TABLE_FROM_JSON: {
      const serverTable = fromJS(JSON.parse(action.tableJSON));

      // TODO: consider storage session data.
      return serverTable.set(
        'updateTriggers',
        fromJS({
          data: {
            rows: {},
          },
        })
      ).set(
        'session',
        fromJS({
          pointer: {
            cellId: null,
            modifiers: {},
          },
          hover: null,
          selection: {
            cellsIds: [],
          },
          clipboard: {
            cells: {},
            operation: null,
          },
        })
      );
    }

    case ActionTypes.SET_PROP: {
      let nextState;
      if (action.cellId) {
        nextState = state.setIn(
          ['data', 'cells', action.cellId, action.prop],
          action.value
        );
      } else {
        nextState = state;
      }

      return nextState;
    }

    case ActionTypes.DELETE_PROP: {
      return state.updateIn(
        ['data', 'cells'],
        value => {
          if (!value.get(action.cellId)) {
            return value;
          }

          return value.deleteIn(
            [action.cellId, action.prop]
          );

          // TODO: only Backscape should do that, not Delete.
          //   (In another action like 'table/WIPE_CELL').
          // let nextValue;
          // if (deletedPropValue.get(action.cellId).size === 0) {
          //   nextValue = deletedPropValue.delete(action.cellId);
          // } else {
          //   nextValue = deletedPropValue;
          // }
        }
      );
    }

    case ActionTypes.SET_HOVER: {
      return state.setIn(
        ['session', 'hover'],
        action.cellId
      );
    }

    case ActionTypes.SET_POINTER: {
      let nextState = state;

      // null is valid value for cellId, uses when you want to clear pointer.
      if (action.cellId !== undefined) {
        nextState = nextState.setIn(
          ['session', 'pointer', 'cellId'],
          action.cellId
        );
      }

      if (action.modifiers) {
        // Preventing unnecessary mutations to prevent unnecessary re-renders.
        // TODO: do it everywhere, for example in ActionTypes.SET_CLIPBOARD.
        const currentModifiers = nextState.getIn(
          ['session', 'pointer', 'modifiers'],
        );
        const allKeys = [
          ...Object.keys(action.modifiers),
          ...currentModifiers.keySeq().toArray(),
        ];
        const allKeysUniq = [...new Set(allKeys)];

        allKeysUniq.forEach((modifier) => {
          nextState = nextState.setIn(
            ['session', 'pointer', 'modifiers', modifier],
            action.modifiers[modifier]
          );
        });
      }

      return nextState;
    }

    case ActionTypes.MOVE_POINTER: {
      const rows = state.getIn(['data', 'rows']);
      const columns = state.getIn(['data', 'columns']);
      const pointerCellId = state.getIn(['session', 'pointer', 'cellId']);

      let currentPointerPos;
      if (pointerCellId) {
        currentPointerPos = [
          rows.findIndex((row) => row.get('id') === getRowId(pointerCellId)),
          columns.findIndex((column) => column.get('id') === getColumnId(pointerCellId)),
        ];
      }

      const newPointerPos = calcNewPos(currentPointerPos, action.key, rows, columns);
      const currentMaxPos = getMaxPos(rows, columns);

      let nextPointerRowId;
      let nextPointerColumnId;
      if (getRowNumber(newPointerPos) > getRowNumber(currentMaxPos)) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${rows.size}`;
        } else {
          newRowId = `r${uuid()}`;
        }

        nextPointerRowId = newRowId;

        // TODO: commenting next line should break tests.
        nextPointerColumnId = columns.getIn([getColumnNumber(newPointerPos), 'id']);
      } else if (getColumnNumber(newPointerPos) > getColumnNumber(currentMaxPos)) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${columns.size}`;
        } else {
          newColumnId = `c${uuid()}`;
        }

        // TODO: commenting next line should break tests.
        nextPointerRowId = rows.getIn([getRowNumber(newPointerPos), 'id']);
        nextPointerColumnId = newColumnId;
      } else {
        nextPointerRowId = rows.getIn([getRowNumber(newPointerPos), 'id']);
        nextPointerColumnId = columns.getIn([getColumnNumber(newPointerPos), 'id']);
      }

      const nextPointerCellId = getCellId(nextPointerRowId, nextPointerColumnId);

      return state.setIn(
        ['session', 'pointer', 'cellId'],
        nextPointerCellId
      );
    }

    // TODO: optimize.
    case ActionTypes.SET_CLIPBOARD: {
      return state.setIn(
        ['session', 'clipboard'],
        fromJS(action.clipboard)
      );
    }

    case ActionTypes.TRIGGER_ROW_UPDATE: {
      let nextState = state;
      action.rowIds.forEach((rowId, index) => {
        if (!rowId) {
          return;
        }

        // Using uuid() ensures that after n sequential updates
        // resulting state will be different. This behaviour may be useful if
        // some middleware toggles triggers too.
        nextState = nextState.setIn(
          ['updateTriggers', 'data', 'rows', rowId],
          action.ids[index]
        );
      });

      return nextState;
    }

    // TODO: reducing leaves cells object untouched,
    //   so it should be cleaned afterwards somehow.
    // TODO: DRY refactor (with EXPAND).
    case ActionTypes.DELETE_LINE: {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (
        (action.lineRef === 'ROW' && state.getIn(['data', 'rows']).size === 1) ||
        (action.lineRef === 'COLUMN' && state.getIn(['data', 'columns']).size === 1)
      ) {
        return state;
      }

      let deletingRowId;
      let deletingColumnId;
      let reducedLinesState;
      if (action.lineRef === 'ROW') {
        deletingRowId = state.getIn(['data', 'rows']).getIn([action.lineNumber, 'id']);
        reducedLinesState = state.deleteIn(
          ['data', 'rows', action.lineNumber]
        );
      } else if (action.lineRef === 'COLUMN') {
        deletingColumnId = state.getIn(['data', 'columns']).getIn([action.lineNumber, 'id']);
        reducedLinesState = state.deleteIn(
          ['data', 'columns', action.lineNumber]
        );
      } else {
        reducedLinesState = state;
      }

      const pointerCellId = state.getIn(['session', 'pointer', 'cellId']);
      let deletedPointerState;
      if (
        pointerCellId &&
        (
          getRowId(pointerCellId) === deletingRowId ||
          getColumnId(pointerCellId) === deletingColumnId
        )
      ) {
        deletedPointerState = reducedLinesState.setIn(
          ['session', 'pointer', 'cellId'],
          null
        );
      } else {
        deletedPointerState = reducedLinesState;
      }

      return deletedPointerState;
    }

    case ActionTypes.ADD_LINE: {
      let expandedLinesState;
      if (action.lineRef === 'ROW') {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${action.lineNumber}a`;
        } else {
          newRowId = `r${action.id}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'rows'],
          value => value.insert(
            action.lineNumber,
            fromJS({ id: newRowId })
          )
        );
      } else if (action.lineRef === 'COLUMN') {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${action.lineNumber}a`;
        } else {
          newColumnId = `c${action.id}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'columns'],
          value => value.insert(
            action.lineNumber,
            fromJS({ id: newColumnId })
          )
        );
      }

      return expandedLinesState;
    }

    case ActionTypes.PUSH_CELL_HISTORY: {
      let nextState = state;
      const historyPath = ['data', 'cells', action.cellId, 'history'];
      if (!nextState.getIn(historyPath)) {
        nextState = nextState.setIn(
          historyPath,
          fromJS([])
        );
      }

      nextState = nextState.updateIn(
        historyPath,
        value => value.push(
          fromJS({
            time: action.time,
            value: action.value,
          })
        )
      );

      return nextState;
    }

    case ActionTypes.DELETE_CELL_HISTORY: {
      return state.updateIn(
        ['data', 'cells', action.cellId, 'history'],
        value => value.delete(action.historyIndex)
      )
    }

    case ActionTypes.SAVE_EDITING_CELL_VALUE_IF_NEEDED: {
      // See corresponding middleware.
      // Action requires 'detachments' state branch, unavailable here.
      return state;
    }

    // TODO: optimize setIn.
    // HACK: after actions sequence SET_POINTER (edit: true), SET_PROP, (MOVE_POINTER)
    //   state with 'pointer.modifiers.edit === true' adds to history, thus pressing Ctrl+Z
    //   enters DataCell. But Ctrl+Z won't work while you are in DataCell,
    //   and next Ctrl+Z won't work until you press Esc, which is uncomfortable.
    //   So, here we delete 'edit: true' from pointer's modifiers after undo/redo actions.
    // REVIEW: could it be done by undoable() filter or groupBy?
    //   We need to insert state without pointer to history somehow.
    case ActionTypes.UNDO:
    case ActionTypes.REDO:
      return state.setIn(
        ['session', 'pointer', 'modifiers'],
        fromJS({})
      );

    default:
      return state;
  }
}

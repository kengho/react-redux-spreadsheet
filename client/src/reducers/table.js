import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

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
    case 'SET_TABLE_FROM_JSON': {
      const serverTable = fromJS(JSON.parse(action.tableJSON));

      // TODO: consider storage session data.
      const updateTriggersState = serverTable.set(
        'updateTriggers',
        fromJS({
          data: {
            rows: {},
          },
        })
      );

      let nextState;
      if (!serverTable.get('session')) {
        nextState = updateTriggersState.set(
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
      } else {
        nextState = serverTable;
      }

      return nextState;
    }

    case 'SET_PROP': {
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

    case 'DELETE_PROP': {
      return state.updateIn(
        ['data', 'cells'],
        value => {
          if (!value.get(action.cellId)) {
            return value;
          }

          const deletedPropValue = value.deleteIn(
            [action.cellId, action.prop]
          );

          let nextValue;
          if (deletedPropValue.get(action.cellId).size === 0) {
            nextValue = deletedPropValue.delete(action.cellId);
          } else {
            nextValue = deletedPropValue;
          }

          return nextValue;
        }
      );
    }

    case 'SET_HOVER': {
      return state.setIn(
        ['session', 'hover'],
        action.cellId
      );
    }

    case 'SET_POINTER': {
      return state.setIn(
        ['session', 'pointer'],
        fromJS(action.pointer)
      );
    }

    case 'SET_POINTER_MODIFIERS': {
      return state.setIn(
        ['session', 'pointer', 'modifiers'],
        fromJS(action.modifiers)
      );
    }

    case 'CLEAR_POINTER': {
      return state.setIn(
        ['session', 'pointer'],
        fromJS({ cellId: null, modifiers: {} })
      );
    }

    case 'MOVE_POINTER': {
      const rows = state.getIn(['data', 'rows']).toJS();
      const columns = state.getIn(['data', 'columns']).toJS();
      const pointer = state.getIn(['session', 'pointer']).toJS();

      let currentPointerPos;
      if (pointer.cellId) {
        currentPointerPos = [
          rows.findIndex((row) => row.id === getRowId(pointer.cellId)),
          columns.findIndex((column) => column.id === getColumnId(pointer.cellId)),
        ];
      }

      const newPointerPos = calcNewPos(rows, columns, currentPointerPos, action.key);
      const currentMaxPos = getMaxPos(rows, columns);

      let nextPointerRowId;
      let nextPointerColumnId;
      if (getRowNumber(newPointerPos) > getRowNumber(currentMaxPos)) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${rows.length}`;
        } else {
          newRowId = `r${uuid()}`;
        }

        nextPointerRowId = newRowId;

        // TODO: commenting next line should break tests.
        nextPointerColumnId = columns[getColumnNumber(newPointerPos)].id;
      } else if (getColumnNumber(newPointerPos) > getColumnNumber(currentMaxPos)) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${columns.length}`;
        } else {
          newColumnId = `c${uuid()}`;
        }

        // TODO: commenting next line should break tests.
        nextPointerRowId = rows[getRowNumber(newPointerPos)].id;
        nextPointerColumnId = newColumnId;
      } else {
        nextPointerRowId = rows[getRowNumber(newPointerPos)].id;
        nextPointerColumnId = columns[getColumnNumber(newPointerPos)].id;
      }

      const nextPointerCellId = getCellId(nextPointerRowId, nextPointerColumnId);

      return state.setIn(
        ['session', 'pointer', 'cellId'],
        nextPointerCellId
      );
    }

    case 'SET_SELECTION': {
      return state.setIn(
        ['session', 'selection'],
        fromJS(action.selection)
      );
    }

    case 'CLEAR_SELECTION': {
      return state.setIn(
        ['session', 'selection'],
        fromJS({ cellsIds: [] })
      );
    }

    case 'SET_CLIPBOARD': {
      return state.setIn(
        ['session', 'clipboard'],
        fromJS(action.clipboard)
      );
    }

    case 'CLEAR_CLIPBOARD': {
      return state.setIn(
        ['session', 'clipboard'],
        fromJS({
          cells: [],
          operation: null,
        })
      );
    }

    // TODO: reducing leaves cells object untouched,
    //   so it should be cleaned afterwards somehow.
    // TODO: DRY refactor (with EXPAND).
    case 'REDUCE': {
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

    case 'EXPAND': {
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

    case 'TOGGLE_ROW_UPDATE_TRIGGER': {
      const rowUpdateTriggerPath = ['updateTriggers', 'data', 'rows', action.rowId];
      const currentRowUpdateTrigger = state.getIn(rowUpdateTriggerPath);

      let nextState;
      if (currentRowUpdateTrigger) {
        nextState = state.deleteIn(rowUpdateTriggerPath);
      } else {
        nextState = state.setIn(rowUpdateTriggerPath, true);
      }

      return nextState;
    }

    default:
      return state;
  }
}

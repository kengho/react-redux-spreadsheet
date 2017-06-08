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

export default function table(state = initialState().get('table'), action) {
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
          rows.indexOf(getRowId(pointer.cellId)),
          columns.indexOf(getColumnId(pointer.cellId)),
        ];
      }

      const newPointerPos = calcNewPos(rows, columns, currentPointerPos, action.key);
      const currentMaxPos = getMaxPos(rows, columns);

      let nextPointerRowId = rows[getRowNumber(newPointerPos)];
      let nextPointerColumnId = columns[getColumnNumber(newPointerPos)];
      if (getRowNumber(newPointerPos) > getRowNumber(currentMaxPos)) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${rows.length}`;
        } else {
          newRowId = `r${uuid()}`;
        }

        nextPointerRowId = newRowId;
      } else if (getColumnNumber(newPointerPos) > getColumnNumber(currentMaxPos)) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${columns.length}`;
        } else {
          newColumnId = `c${uuid()}`;
        }

        nextPointerColumnId = newColumnId;
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
    case 'REDUCE': {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (
        (getColumnNumber(action.pos) < 0 && state.getIn(['data', 'rows']).size === 1) ||
        (getRowNumber(action.pos) < 0 && state.getIn(['data', 'columns']).size === 1)
      ) {
        return state;
      }

      let deletingRow;
      let deletingColumn;
      let reducedLinesState;
      if (getColumnNumber(action.pos) < 0) {
        deletingRow = state.getIn(['data', 'rows']).get(getRowNumber(action.pos));
        reducedLinesState = state.deleteIn(
          ['data', 'rows', getRowNumber(action.pos)]
        );
      } else if (getRowNumber(action.pos) < 0) {
        deletingColumn = state.getIn(['data', 'columns']).get(getColumnNumber(action.pos));
        reducedLinesState = state.deleteIn(
          ['data', 'columns', getColumnNumber(action.pos)]
        );
      }

      const pointerCellId = state.getIn(['session', 'pointer', 'cellId']);
      let deletedPointerState;
      if (
        pointerCellId &&
        (
          getRowId(pointerCellId) === deletingRow ||
          getColumnId(pointerCellId) === deletingColumn
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
      if (getColumnNumber(action.pos) < 0) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${getRowNumber(action.pos)}a`;
        } else {
          newRowId = `r${action.id}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'rows'],
          value => value.insert(
            getRowNumber(action.pos),
            newRowId
          )
        );
      } else if (getRowNumber(action.pos) < 0) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${getColumnNumber(action.pos)}a`;
        } else {
          newColumnId = `c${action.id}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'columns'],
          value => value.insert(
            getColumnNumber(action.pos),
            newColumnId
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

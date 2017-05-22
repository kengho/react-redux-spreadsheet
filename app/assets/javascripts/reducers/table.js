import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

import {
  calcNewPos,
  initialState,
  rowNumber,
  columnNumber,
  maxPos,
  rowId,
  columnId,
  cellId,
} from '../core';

// process.log = (x) => console.log(JSON.stringify(x, null, 2));

export default function table(state = initialState().get('table'), action) {
  switch (action.type) {
    case 'SET_TABLE_FROM_JSON': {
      const serverTable = fromJS(JSON.parse(action.tableJSON));
      let newState;

      // TODO: consider storage session data.
      if (!serverTable.get('session')) {
        newState = serverTable.set(
          'session',
          fromJS({
            pointer: {
              id: null,
              modifiers: {},
            },
            hover: null,
            selection: [],
          })
        );
      } else {
        newState = serverTable;
      }

      return newState;
    }

    case 'SET_PROP': {
      return state.setIn(
        ['data', 'cells', action.cellId, action.prop],
        action.value
      );
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

          let newValue;
          if (deletedPropValue.get(action.cellId).size === 0) {
            newValue = deletedPropValue.delete(action.cellId);
          } else {
            newValue = deletedPropValue;
          }

          return newValue;
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

    case 'MOVE_POINTER': {
      const currentRows = state.getIn(['data', 'rows']).toJS();
      const currentColumns = state.getIn(['data', 'columns']).toJS();
      const currentPointer = state.getIn(['session', 'pointer']).toJS();

      let currentPointerPos;
      if (currentPointer.cellId) {
        currentPointerPos = [
          currentRows.indexOf(rowId(currentPointer.cellId)),
          currentColumns.indexOf(columnId(currentPointer.cellId)),
        ];
      } else {
        currentPointerPos = [];
      }

      const newPointerPos = calcNewPos(currentRows, currentColumns, currentPointerPos, action.key);
      const currentMaxPos = maxPos(currentRows, currentColumns);

      let newRows;
      let newColumns;
      let expandedState;
      if (rowNumber(newPointerPos) > rowNumber(currentMaxPos)) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${currentRows.length}`;
        } else {
          newRowId = `r${uuid()}`;
        }

        expandedState = state.updateIn(
          ['data', 'rows'],
          value => value.push(newRowId)
        );
        newRows = expandedState.getIn(['data', 'rows']).toJS();
        newColumns = currentColumns;
      } else if (columnNumber(newPointerPos) > columnNumber(currentMaxPos)) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${currentColumns.length}`;
        } else {
          newColumnId = `c${uuid()}`;
        }

        expandedState = state.updateIn(
          ['data', 'columns'],
          value => value.push(newColumnId)
        );
        newRows = currentRows;
        newColumns = expandedState.getIn(['data', 'columns']).toJS();
      } else {
        expandedState = state;
        newRows = currentRows;
        newColumns = currentColumns;
      }

      const newPointerCellId = cellId(
        newRows[rowNumber(newPointerPos)],
        newColumns[columnNumber(newPointerPos)]
      );

      return expandedState.setIn(
        ['session', 'pointer', 'cellId'],
        newPointerCellId
      );
    }

    // NOTE: reducing leaves cells object untouched,
    //   so it should be cleaned afterwards somehow.
    case 'REDUCE': {
      let deletingRow;
      let deletingColumn;
      let reducedLinesState;
      if (columnNumber(action.pos) < 0) {
        deletingRow = state.getIn(['data', 'rows']).get(rowNumber(action.pos));
        reducedLinesState = state.deleteIn(
          ['data', 'rows', rowNumber(action.pos)]
        );
      } else if (rowNumber(action.pos) < 0) {
        deletingColumn = state.getIn(['data', 'columns']).get(columnNumber(action.pos));
        reducedLinesState = state.deleteIn(
          ['data', 'columns', columnNumber(action.pos)]
        );
      }

      const currentPointerCellId = state.getIn(['session', 'pointer', 'cellId']);
      let deletedPointerState;
      if (
        currentPointerCellId &&
        (
          rowId(currentPointerCellId) === deletingRow ||
          columnId(currentPointerCellId) === deletingColumn
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
      if (columnNumber(action.pos) < 0) {
        let newRowId;
        if (process.env.NODE_ENV === 'test') {
          newRowId = `r${rowNumber(action.pos)}a`;
        } else {
          newRowId = `r${uuid()}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'rows'],
          value => value.insert(
            rowNumber(action.pos),
            newRowId
          )
        );
      } else if (rowNumber(action.pos) < 0) {
        let newColumnId;
        if (process.env.NODE_ENV === 'test') {
          newColumnId = `c${columnNumber(action.pos)}a`;
        } else {
          newColumnId = `c${uuid()}`;
        }

        expandedLinesState = state.updateIn(
          ['data', 'columns'],
          value => value.insert(
            columnNumber(action.pos),
            newColumnId
          )
        );
      }

      return expandedLinesState;
    }

    default:
      return state;
  }
}

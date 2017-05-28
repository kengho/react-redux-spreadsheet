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

// process.log = (x) => console.log(JSON.stringify(x, null, 2));

export default function table(state = initialState().get('table'), action) {
  switch (action.type) {
    case 'SET_TABLE_FROM_JSON': {
      const serverTable = fromJS(JSON.parse(action.tableJSON));
      let nextState;

      // TODO: consider storage session data.
      if (!serverTable.get('session')) {
        nextState = serverTable.set(
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

    case 'MOVE_POINTER': {
      const currentRows = state.getIn(['data', 'rows']).toJS();
      const currentColumns = state.getIn(['data', 'columns']).toJS();
      const pointer = state.getIn(['session', 'pointer']).toJS();

      let currentPointerPos;
      if (pointer.cellId) {
        currentPointerPos = [
          currentRows.indexOf(getRowId(pointer.cellId)),
          currentColumns.indexOf(getColumnId(pointer.cellId)),
        ];
      } else {
        currentPointerPos = [];
      }

      const nextPointerPos = calcNewPos(currentRows, currentColumns, currentPointerPos, action.key);
      const currentMaxPos = getMaxPos(currentRows, currentColumns);

      let nextRows;
      let nextColumns;
      let expandedState;
      if (getRowNumber(nextPointerPos) > getRowNumber(currentMaxPos)) {
        let nextRowId;
        if (process.env.NODE_ENV === 'test') {
          nextRowId = `r${currentRows.length}`;
        } else {
          nextRowId = `r${uuid()}`;
        }

        expandedState = state.updateIn(
          ['data', 'rows'],
          value => value.push(nextRowId)
        );
        nextRows = expandedState.getIn(['data', 'rows']).toJS();
        nextColumns = currentColumns;
      } else if (getColumnNumber(nextPointerPos) > getColumnNumber(currentMaxPos)) {
        let nextColumnId;
        if (process.env.NODE_ENV === 'test') {
          nextColumnId = `c${currentColumns.length}`;
        } else {
          nextColumnId = `c${uuid()}`;
        }

        expandedState = state.updateIn(
          ['data', 'columns'],
          value => value.push(nextColumnId)
        );
        nextRows = currentRows;
        nextColumns = expandedState.getIn(['data', 'columns']).toJS();
      } else {
        expandedState = state;
        nextRows = currentRows;
        nextColumns = currentColumns;
      }

      const nextPointerCellId = getCellId(
        nextRows[getRowNumber(nextPointerPos)],
        nextColumns[getColumnNumber(nextPointerPos)]
      );

      return expandedState.setIn(
        ['session', 'pointer', 'cellId'],
        nextPointerCellId
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
          newRowId = `r${uuid()}`;
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
          newColumnId = `c${uuid()}`;
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

    default:
      return state;
  }
}

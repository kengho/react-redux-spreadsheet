import { fromJS } from 'immutable';

import {
  calcNewPos,
  defaultCell,
  initialState,
  rowNumber,
  columnNumber,
  defaultSelection,
} from '../core';

const updatePointer = (value, action, increment) => {
  if (columnNumber(action.pos) < 0) {
    const diff = rowNumber(value.toJS()) - rowNumber(action.pos);
    switch (true) {
      case (diff < 0):
        return value;
      case (diff === 0):
        return fromJS([]);
      case (diff > 0):
        return value.update(
          0, // TODO: make some kind of rowNumber setter.
          posValue => posValue + increment
        );
      default:
    }
  } else if (rowNumber(action.pos) < 0) {
    const diff = columnNumber(value.toJS()) - columnNumber(action.pos);
    switch (true) {
      case (diff < 0):
        return value;
      case (diff === 0):
        return fromJS([]);
      case (diff > 0):
        return value.update(
          1, // TODO: make some kind of columnNumber setter.
          posValue => posValue + increment
        );
      default:
    }
  }

  return value;
};

export default function table(state = initialState().get('table'), action) {
  const tableHeight = state.get('data').size;
  const tableWidth = state.get('data').get(0).size;
  const lastRowNumber = tableHeight - 1;
  const lastColumnNumber = tableWidth - 1;

  switch (action.type) {
    case 'SET_DATA': {
      return state.set(
        'data',
        fromJS(action.data)
      ).set(
        'selection',
        fromJS(defaultSelection(action.data))
      );
    }

    case 'SET_PROP': {
      return state.updateIn(
        ['data', rowNumber(action.pos), columnNumber(action.pos)],
        value => value.set(action.prop, action.value)
      );
    }

    case 'DELETE_PROP': {
      return state.updateIn(
        ['data', rowNumber(action.pos), columnNumber(action.pos)],
        value => value.delete(action.prop)
      );
    }

    case 'SET_HOVER': {
      return state.set(
        'hover',
        fromJS(action.pos)
      );
    }

    case 'SET_POINTER': {
      // TODO: test.
      const currentPos = state.get('pointer').get('pos').toJS();
      let pos = action.pos;
      if (!action.pos) {
        if (currentPos.length === 0) {
          pos = [0, 0];
        } else {
          pos = currentPos;
        }
      }
      // /TODO: test.

      return state.set(
        'pointer',
        fromJS({ pos, modifiers: action.modifiers })
      );
    }

    // TODO: 'smart' movenent
    //   (like tab - tab - tab - enter => shift [-3, +1])
    case 'MOVE_POINTER': {
      const posNew = calcNewPos(state, action.key);

      const addRowIfNeeded = (value, currentRowNumber) => {
        if (currentRowNumber === lastRowNumber + 1) {
          const newRow = Array.from(Array(tableWidth)).map(() => {
            return defaultCell();
          });
          return value.push(fromJS(newRow));
        }

        return value;
      };

      const addColumnIfNeeded = (value, currentColumnNumber) => {
        if (currentColumnNumber === lastColumnNumber + 1) {
          return value.map(
            rowValue => rowValue.insert(value.size, fromJS(defaultCell()))
          );
        }

        return value;
      };

      const changedDataState = state.update(
        'data',
        value => addRowIfNeeded(value, rowNumber(posNew))
      ).update(
        'data',
        value => addColumnIfNeeded(value, columnNumber(posNew))
      );

      // @TODO: test non-changing modifiers.
      return changedDataState.set(
        'selection',
        fromJS(defaultSelection(changedDataState.get('data').toJS()))
      ).setIn(
        ['pointer', 'pos'],
        fromJS(posNew)
      );
    }

    case 'REDUCE': {
      if (columnNumber(action.pos) < 0) {
        return state.deleteIn(
          ['data', rowNumber(action.pos)]
        ).deleteIn(
          ['selection', rowNumber(action.pos)]
        ).updateIn(
          ['pointer', 'pos'],
          value => updatePointer(value, action, -1)
        );
      } else if (rowNumber(action.pos) < 0) {
        return state.update(
          'data',
          value => value.map(
            rowValue => rowValue.delete(columnNumber(action.pos))
          )
        ).update(
          'selection',
          value => value.map(
            rowValue => rowValue.delete(columnNumber(action.pos))
          )
        ).updateIn(
          ['pointer', 'pos'],
          value => updatePointer(value, action, -1)
        );
      }
      break;
    }

    case 'EXPAND': {
      if (columnNumber(action.pos) < 0) {
        const newDataRow = Array.from(Array(tableWidth)).map(() => {
          return defaultCell();
        });
        const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
          return undefined;
        });

        return state.update(
          'data',
          value => value.insert(
            rowNumber(action.pos),
            fromJS(newDataRow)
          )
        ).update(
          'selection',
          value => value.insert(
            rowNumber(action.pos),
            fromJS(newSelectionRow)
          )
        ).updateIn(
          ['pointer', 'pos'],
          value => updatePointer(value, action, 1)
        );
      } else if (rowNumber(action.pos) < 0) {
        return state.update(
          'data',
          value => value.map(
            rowValue => rowValue.insert(
              columnNumber(action.pos),
              fromJS(defaultCell())
            )
          )
        ).update(
          'selection',
          value => value.map(
            rowValue => rowValue.insert(
              columnNumber(action.pos),
              undefined
            )
          )
        ).updateIn(
          ['pointer', 'pos'],
          value => updatePointer(value, action, 1)
        );
      }
      break;
    }

    default:
      return state;
  }

  return state;
}

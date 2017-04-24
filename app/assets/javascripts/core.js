import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

// 'defaultCell' isn't just an object because we want brand new copy of it
// each time we call it.
export function defaultCell() {
  return { id: uuid() };
}

export function defaultTable(height = 4, width = 4, fill = 'DEFAULT_CELL') {
  const table = Array.from(Array(height)).map((_, rowIndex) => {
    return Array.from(Array(width)).map((__, columnIndex) => {
      switch (fill) {
        case 'DEFAULT_CELL':
          return defaultCell();
        case 'UNDEFINED':
          return undefined;
        case 'INDEX':
          return Object.assign(defaultCell(), { value: String((rowIndex * width) + columnIndex) });
        default:
          return '';
      }
    });
  });

  return table;
}

export function defaultSelection(data) {
  return defaultTable(data.length, data[0].length, 'UNDEFINED');
}

export function initialState(width, height, fill = 'DEFAULT_CELL') {
  const data = defaultTable(width, height, fill);

  return fromJS({
    table: {
      data,
      selection: defaultSelection(data),
      pointer: {

        // REVIEW: pos should be object with rowNumber, columnNumber, equal
        //   and other useful methods.
        //   But immutable store shouldn't contain functions.
        //   http://redux.js.org/docs/faq/OrganizingState.html#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state
        pos: [],

        // TODO: modifiers should be object.
        modifiers: [],
      },
      hover: [],
    },
  });
}

export function rowNumber(pos) {
  return pos[0];
}

export function columnNumber(pos) {
  return pos[1];
}

// Indicates that Cell represents some row or column (in actions and etc).
export function lineRef(pos) {
  let ref;
  if (!pos) {
    ref = undefined;
  } else if (rowNumber(pos) >= 0) {
    ref = 'row';
  } else if (columnNumber(pos) >= 0) {
    ref = 'column';
  }

  return ref;
}

export function calcNewPos(state, key) {
  const pos = state.get('pointer').get('pos').toJS();
  const lastRowNumber = state.get('selection').size - 1;
  const lastColumnNumber = state.get('selection').get(0).size - 1;

  let newRowNumber;
  let newColumnNumber;
  switch (key) {
    case 'ArrowUp': {
      if (pos.length === 0) {
        newRowNumber = lastRowNumber;
        newColumnNumber = 0;
      } else {
        newRowNumber = rowNumber(pos) - 1;
        newColumnNumber = columnNumber(pos);
      }
      break;
    }

    case 'PageUp': {
      newRowNumber = 0;
      if (pos.length === 0) {
        newColumnNumber = 0;
      } else {
        newColumnNumber = columnNumber(pos);
      }
      break;
    }

    case 'ArrowDown': {
      if (pos.length === 0) {
        newRowNumber = 0;
        newColumnNumber = 0;
      } else {
        newRowNumber = rowNumber(pos) + 1;
        newColumnNumber = columnNumber(pos);
      }
      break;
    }

    case 'PageDown': {
      newRowNumber = lastRowNumber;
      if (pos.length === 0) {
        newColumnNumber = 0;
      } else {
        newColumnNumber = columnNumber(pos);
      }
      break;
    }

    case 'ArrowLeft': {
      if (pos.length === 0) {
        newRowNumber = 0;
        newColumnNumber = lastColumnNumber;
      } else {
        newRowNumber = rowNumber(pos);
        newColumnNumber = columnNumber(pos) - 1;
      }
      break;
    }

    case 'Home': {
      newColumnNumber = 0;
      if (pos.length === 0) {
        newRowNumber = 0;
      } else {
        newRowNumber = rowNumber(pos);
      }
      break;
    }

    case 'ArrowRight': {
      if (pos.length === 0) {
        newRowNumber = 0;
        newColumnNumber = 0;
      } else {
        newRowNumber = rowNumber(pos);
        newColumnNumber = columnNumber(pos) + 1;
      }
      break;
    }

    case 'End': {
      newColumnNumber = lastColumnNumber;
      if (pos.length === 0) {
        newRowNumber = 0;
      } else {
        newRowNumber = rowNumber(pos);
      }
      break;
    }

    default:
  }

  if (newRowNumber < 0) {
    newRowNumber = 0;
  }
  if (newColumnNumber < 0) {
    newColumnNumber = 0;
  }

  return [newRowNumber, newColumnNumber];
}

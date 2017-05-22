import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

// TODO: rename getters to `get${functionName}`.
export function rowId(currentCellId) {
  return currentCellId.slice(
    0,
    Math.floor(currentCellId.length / 2)
  );
}

export function columnId(currentCellId) {
  return currentCellId.slice(
    Math.ceil(currentCellId.length / 2),
    currentCellId.length
  );
}

export function cellId(currentRowId, currentColumnId) {
  return `${currentRowId},${currentColumnId}`;
}

export function rowNumber(pos) {
  return pos[0];
}

export function columnNumber(pos) {
  return pos[1];
}

export function initialLines(height = 4, width = 4) {
  const rows = Array.from(Array(height)).map((_, rowIndex) => {
    let newRowId;
    if (process.env.NODE_ENV === 'test') {
      newRowId = `r${rowIndex}`;
    } else {
      newRowId = `r${uuid()}`;
    }

    return newRowId;
  });

  const columns = Array.from(Array(width)).map((_, columnIndex) => {
    let newColumnId;
    if (process.env.NODE_ENV === 'test') {
      newColumnId = `c${columnIndex}`;
    } else {
      newColumnId = `c${uuid()}`;
    }

    return newColumnId;
  });

  return { rows, columns };
}

export function initialTable(width, height) {
  const lines = initialLines(width, height);

  return {
    data: {
      ...lines,
      cells: {},
    },
    session: {
      pointer: {
        cellId: null,
        modifiers: {},
      },
      hover: null,
      selection: [],
    },
  };
}

export function initialState(width, height) {
  const table = initialTable(width, height);

  return fromJS({
    table,
  });
}

// Indicates that Cell represents some row or column (in actions and etc).
export function lineRef(pos) {
  let ref;
  if (rowNumber(pos) >= 0) {
    ref = 'ROW';
  } else if (columnNumber(pos) >= 0) {
    ref = 'COLUMN';
  }

  return ref;
}

export function maxPos(rows, columns) {
  return [rows.length - 1, columns.length - 1];
}

export function calcNewPos(rows, columns, pos, key) {
  const currentMaxPos = maxPos(rows, columns);

  let newRowNumber;
  let newColumnNumber;
  switch (key) {
    case 'ArrowUp': {
      if (pos.length === 0) {
        newRowNumber = rowNumber(currentMaxPos);
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
      newRowNumber = rowNumber(currentMaxPos);
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
        newColumnNumber = columnNumber(currentMaxPos);
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
      newColumnNumber = columnNumber(currentMaxPos);
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

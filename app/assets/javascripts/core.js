import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

// TODO: rename getters to `get${functionName}`.
export function getRowId(cellId) {
  return cellId.slice(
    0,
    Math.floor(cellId.length / 2)
  );
}

export function getColumnId(cellId) {
  return cellId.slice(
    Math.ceil(cellId.length / 2),
    cellId.length
  );
}

export function getCellId(rowId, columnId) {
  return `${rowId},${columnId}`;
}

export function getRowNumber(pos) {
  return pos[0];
}

export function getColumnNumber(pos) {
  return pos[1];
}

export function initialLines(height = 4, width = 4) {
  const rows = Array.from(Array(height)).map((_, rowIndex) => {
    let rowId;
    if (process.env.NODE_ENV === 'test') {
      rowId = `r${rowIndex}`;
    } else {
      rowId = `r${uuid()}`;
    }

    return rowId;
  });

  const columns = Array.from(Array(width)).map((_, columnIndex) => {
    let columnId;
    if (process.env.NODE_ENV === 'test') {
      columnId = `c${columnIndex}`;
    } else {
      columnId = `c${uuid()}`;
    }

    return columnId;
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
export function getLineRef(pos) {
  let ref;
  if (getRowNumber(pos) >= 0) {
    ref = 'ROW';
  } else if (getColumnNumber(pos) >= 0) {
    ref = 'COLUMN';
  }

  return ref;
}

export function getMaxPos(rows, columns) {
  return [rows.length - 1, columns.length - 1];
}

export function calcNewPos(rows, columns, pos, key) {
  const maxPos = getMaxPos(rows, columns);

  let rowNumber;
  let columnNumber;
  switch (key) {
    case 'ArrowUp': {
      if (pos.length === 0) {
        rowNumber = getRowNumber(maxPos);
        columnNumber = 0;
      } else {
        rowNumber = getRowNumber(pos) - 1;
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'PageUp': {
      rowNumber = 0;
      if (pos.length === 0) {
        columnNumber = 0;
      } else {
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'ArrowDown': {
      if (pos.length === 0) {
        rowNumber = 0;
        columnNumber = 0;
      } else {
        rowNumber = getRowNumber(pos) + 1;
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'PageDown': {
      rowNumber = getRowNumber(maxPos);
      if (pos.length === 0) {
        columnNumber = 0;
      } else {
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'ArrowLeft': {
      if (pos.length === 0) {
        rowNumber = 0;
        columnNumber = getColumnNumber(maxPos);
      } else {
        rowNumber = getRowNumber(pos);
        columnNumber = getColumnNumber(pos) - 1;
      }
      break;
    }

    case 'Home': {
      columnNumber = 0;
      if (pos.length === 0) {
        rowNumber = 0;
      } else {
        rowNumber = getRowNumber(pos);
      }
      break;
    }

    case 'ArrowRight': {
      if (pos.length === 0) {
        rowNumber = 0;
        columnNumber = 0;
      } else {
        rowNumber = getRowNumber(pos);
        columnNumber = getColumnNumber(pos) + 1;
      }
      break;
    }

    case 'End': {
      columnNumber = getColumnNumber(maxPos);
      if (pos.length === 0) {
        rowNumber = 0;
      } else {
        rowNumber = getRowNumber(pos);
      }
      break;
    }

    default:
  }

  if (rowNumber < 0) {
    rowNumber = 0;
  }
  if (columnNumber < 0) {
    columnNumber = 0;
  }

  return [rowNumber, columnNumber];
}

// NOTE: order or props on array is important.
//   Place strings in the beginning, objects in the end (more complex => closer to the end).
export function arePropsEqual(currentProps, nextProps, props) {
  return !props.some((prop) => {
    let propsArentEqual;
    if (typeof nextProps[prop] === 'object') {
      propsArentEqual = (JSON.stringify(nextProps[prop]) !== JSON.stringify(currentProps[prop]));
    } else {
      propsArentEqual = (nextProps[prop] !== currentProps[prop]);
    }

    return propsArentEqual;
  });
}

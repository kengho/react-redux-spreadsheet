import { fromJS, Map } from 'immutable';
import uuid from 'uuid/v4';
import Baby from 'babyparse';

if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-undef, no-console
  window.log = (x) => console.log(JSON.stringify(x, null, 2));
}

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

// TODO: get rid of pos everywhere.
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

    return { id: rowId };
  });

  const columns = Array.from(Array(width)).map((_, columnIndex) => {
    let columnId;
    if (process.env.NODE_ENV === 'test') {
      columnId = `c${columnIndex}`;
    } else {
      columnId = `c${uuid()}`;
    }

    return { id: columnId };
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
      selection: {
        cellsIds: [],
      },
      clipboard: {
        cells: {},
        operation: null,
      },
    },
    updateTriggers: {
      data: {
        rows: {},
      },
    },
  };
}

export function initialState(width, height) {
  const table = initialTable(width, height);

  let state;
  // REVIEW: is there are way to apply redux-undo for tests automatically?
  if (process.env.NODE_ENV === 'test') {
    state = Map({
      table: {
        past: [],
        present: fromJS(table),
        future: [],
      },
    });
  } else {
    state = fromJS({
      table,
    });
  }

  return state;
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
      if (!pos) {
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
      if (!pos) {
        columnNumber = 0;
      } else {
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'ArrowDown': {
      if (!pos) {
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
      if (!pos) {
        columnNumber = 0;
      } else {
        columnNumber = getColumnNumber(pos);
      }
      break;
    }

    case 'ArrowLeft': {
      if (!pos) {
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
      if (!pos) {
        rowNumber = 0;
      } else {
        rowNumber = getRowNumber(pos);
      }
      break;
    }

    case 'ArrowRight': {
      if (!pos) {
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
      if (!pos) {
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

// NOTE: order or props in array is important.
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

export function getCroppedSize(data) {
  // Cropped size search algorithm.
  //
  // [B] - beginning point
  // [ ] - current point
  // [D] - destination point
  // [↑, ←] - search directions
  // [a-z] - cells' values
  //
  // TODO: decide, should we require additional data
  //   in store to provide more optimal crop algorithms.
  //
  //    0  1  2  3  4
  // 0  a  b  c  ↑  ↑
  // 1  d  e [D] ↑  ↑
  // 2  ←  ← [ ] ↑  ↑
  // 3  ←  ← [ ] ↑  ↑
  // 4  ←  ←  ← [ ] ↑
  // 5  ←  ←  ←  ← [B]

  const cells = data.cells;
  if (Object.keys(cells).length === 0) {
    return [0, 0];
  }

  let rows = data.rows;
  let columns = data.columns;
  const backwardVHSeach = (point, matchPoint = [null, null]) => {
    const [rowNumber, columnNumber] = point;
    let [rowMatch, columnMatch] = matchPoint;

    if (!rowMatch) {
      for (let rowIterator = rowNumber; rowIterator >= 0; rowIterator -= 1) {
        const currentCellId = getCellId(rows[rowIterator].id, columns[columnNumber].id);
        if (cells[currentCellId]) {
          rowMatch = rowIterator;
          break;
        }
      }
    }

    if (!columnMatch) {
      for (let columnIterator = columnNumber; columnIterator >= 0; columnIterator -= 1) {
        const currentCellId = getCellId(rows[rowNumber].id, columns[columnIterator].id);
        if (cells[currentCellId]) {
          columnMatch = columnIterator;
          break;
        }
      }
    }

    return [rowMatch, columnMatch];
  };

  const currentPoint = [rows.length - 1, columns.length - 1];

  let matchPoint;
  while (true) {
    const [rowMatch, columnMatch] = backwardVHSeach(currentPoint, matchPoint);
    if (rowMatch !== null && columnMatch !== null) {
      return [currentPoint[0] + 1, currentPoint[1] + 1];
    }

    if (currentPoint[0] === 0 && currentPoint[1] === 0) {
      return [0, 0];
    }

    if (columnMatch === null && currentPoint[0] > 0) {
      currentPoint[0] -= 1;
    }

    if (rowMatch === null && currentPoint[1] > 0) {
      currentPoint[1] -= 1;
    }
  }
}

export function convert(object, options) {
  if (options.inputFormat === 'object' && options.outputFormat === 'csv') {
    const data = object;
    const rows = data.rows;
    const columns = data.columns;
    const cells = data.cells;
    const croppedSize = getCroppedSize(data);

    const CSVArray = [];
    for (let rowIterator = 0; rowIterator < croppedSize[0]; rowIterator += 1) {
      const CSVRowArray = [];
      for (let columnIterator = 0; columnIterator < croppedSize[1]; columnIterator += 1) {
        const currentCellId = getCellId(rows[rowIterator].id, columns[columnIterator].id);
        const currentCell = cells[currentCellId];

        let value;
        if (currentCell) {
          value = currentCell.value;
        } else {
          value = '';
        }

        CSVRowArray.push(value);
      }

      CSVArray.push(CSVRowArray);
    }

    return Baby.unparse(CSVArray);
  }

  if (options.inputFormat === 'csv' && options.outputFormat === 'object') {
    const CSV = object;
    const parsedCSV = Baby.parse(CSV);

    const parsedCSVArray = parsedCSV.data;
    const tableData = {
      errors: parsedCSV.errors,
    };

    if (parsedCSVArray.length > 0) {
      const dataArrayRowsNumber = parsedCSVArray.length;
      const dataArrayColumnsNumber = parsedCSVArray[0].length;

      const data = initialTable(dataArrayRowsNumber, dataArrayColumnsNumber).data;
      const rows = data.rows;
      const columns = data.columns;
      const cells = data.cells;

      parsedCSVArray.forEach((row, rowIndex) => {
        row.forEach((value, columnIndex) => {
          if (value.length > 0) {
            const cellId = getCellId(rows[rowIndex].id, columns[columnIndex].id);
            cells[cellId] = { value };
          }
        });
      });

      tableData.data = data;
    } else {
      tableData.data = initialTable().data;
    }

    return tableData;
  }
}

import { fromJS, Map } from 'immutable';
import Papa from 'papaparse';
import uuid from 'uuid/v4';

if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-undef, no-console
  window.log = (x) => console.log(JSON.stringify(x, null, 2));
}

// TODO: add cellId format checks.
export function getRowId(cellId) {
  if (cellId) {
    return cellId.slice(
      0,
      Math.floor(cellId.length / 2)
    );
  }
}

export function getColumnId(cellId) {
  if (cellId) {
    return cellId.slice(
      Math.ceil(cellId.length / 2),
      cellId.length
    );
  }
}

export function getCellId(rowId, columnId) {
  if (rowId && columnId) {
    return `${rowId},${columnId}`;
  }
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

  // REVIEW: maybe use 'k' for 'kolumn' instead
  //   just not to confuse it with with UUID hex chars.
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

export function initialState(width, height, test = false) {
  const table = initialTable(width, height);

  let state;
  if (test) {
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
  return [rows.size - 1, columns.size - 1];
}

export function calcNewPos(pos, key, rows, columns) {
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
// NOTE: this thing doesn't compare js objects anymore, only strings and immutable.
export function arePropsEqual(currentProps, nextProps, props) {
  return !props.some((prop) => {
    const currentProp = currentProps[prop];
    const nextProp = nextProps[prop];

    return (nextProp !== currentProp);
  });
}

// NOTE: data is immutable.
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

  const cells = data.get('cells');
  if (cells.keySeq().size === 0) {
    return [0, 0];
  }

  let rows = data.get('rows');
  let columns = data.get('columns');
  const backwardVHSeach = (point, matchPoint = [null, null]) => {
    const [rowNumber, columnNumber] = point;
    let [rowMatch, columnMatch] = matchPoint;

    if (!rowMatch) {
      for (let rowIterator = rowNumber; rowIterator >= 0; rowIterator -= 1) {
        const currentCellId = getCellId(
          rows.getIn([rowIterator, 'id']),
          columns.getIn([columnNumber, 'id'])
        );
        if (cells.get(currentCellId)) {
          rowMatch = rowIterator;
          break;
        }
      }
    }

    if (!columnMatch) {
      for (let columnIterator = columnNumber; columnIterator >= 0; columnIterator -= 1) {
        const currentCellId = getCellId(
          rows.getIn([rowNumber, 'id']),
          columns.getIn([columnIterator, 'id'])
        );
        if (cells.get(currentCellId)) {
          columnMatch = columnIterator;
          break;
        }
      }
    }

    return [rowMatch, columnMatch];
  };

  const currentPoint = [rows.size - 1, columns.size - 1];

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
  // Immutable to string.
  if (options.inputFormat === 'object' && options.outputFormat === 'csv') {
    const data = object;
    const rows = data.get('rows');
    const columns = data.get('columns');
    const cells = data.get('cells');
    const croppedSize = getCroppedSize(data);

    const CSVArray = [];
    for (let rowIterator = 0; rowIterator < croppedSize[0]; rowIterator += 1) {
      const CSVRowArray = [];
      for (let columnIterator = 0; columnIterator < croppedSize[1]; columnIterator += 1) {
        const currentCellId = getCellId(
          rows.getIn([rowIterator, 'id']),
          columns.getIn([columnIterator, 'id'])
        );
        const currentCell = cells.get(currentCellId);

        let value;
        if (currentCell) {
          value = currentCell.get('value');
        } else {
          value = '';
        }

        CSVRowArray.push(value);
      }

      CSVArray.push(CSVRowArray);
    }

    return Papa.unparse(CSVArray);
  }

  // String to object.
  // NOTE: we don't convert it to immutable
  //   since we are going to use tableSetFromJSON anyway.
  if (options.inputFormat === 'csv' && options.outputFormat === 'object') {
    const CSV = object;
    const parsedCSV = Papa.parse(CSV);

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

  // Immutable to JSON.
  // TODO: DRY.
  if (options.inputFormat === 'object' && options.outputFormat === 'json') {
    const data = object;
    const rows = data.get('rows');
    const columns = data.get('columns');
    const cells = data.get('cells');
    const croppedSize = getCroppedSize(data);

    const JSONArray = [];
    for (let rowIterator = 0; rowIterator < croppedSize[0]; rowIterator += 1) {
      const JSONRowArray = [];
      for (let columnIterator = 0; columnIterator < croppedSize[1]; columnIterator += 1) {
        const currentCellId = getCellId(
          rows.getIn([rowIterator, 'id']),
          columns.getIn([columnIterator, 'id'])
        );
        const currentCell = cells.get(currentCellId);

        let cell = {};
        if (currentCell) {
          const currentCellValue = currentCell.get('value');
          if (currentCellValue && currentCellValue !== '') {
            cell.value = currentCellValue;
          }
          if (currentCell.get('history')) {
            cell.history = currentCell.get('history').map((record) => {
              // 1513645323000
              // =>
              // 2017-12-19T01:02:03.000Z
              // =>
              // 2017-12-19T01:02:03
              // // https://stackoverflow.com/a/34053802
              const time = (new Date(record.get('time')).toISOString()).split('.')[0];
              return {
                time,
                value: record.get('value'),
              };
            });
          }
        }

        JSONRowArray.push(cell);
      }
      JSONArray.push(JSONRowArray);
    }

    return JSON.stringify(JSONArray);
  }

  // JSON to object.
  if (options.inputFormat === 'json' && options.outputFormat === 'object') {
    let parsedJSON;
    const tableData = {};
    try {
      parsedJSON = JSON.parse(object);
    } catch(err) {
      tableData.errors = [`${err.name}: ${err.message}`]
    }

    if (parsedJSON) {
      const dataArrayRowsNumber = parsedJSON.length;
      const dataArrayColumnsNumber = parsedJSON[0].length;
      const data = initialTable(dataArrayRowsNumber, dataArrayColumnsNumber).data;
      const rows = data.rows;
      const columns = data.columns;
      const cells = data.cells;

      parsedJSON.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          // Skip empty cells.
          if (Object.keys(cell).length === 0) {
            return;
          }

          const cellId = getCellId(rows[rowIndex].id, columns[columnIndex].id);
          const convertedCell = { ...cell };
          if (cell.history) {
            convertedCell.history = cell.history.map((record, recordIndex) => {
              // 2017-12-19T01:02:03
              // =>
              // 1513645323000
              // TODO: catch errors.
              const time = new Date(record.time).getTime();
              return {
                time,
                value: record.value,
              };
            });

            // TODO: test.
            convertedCell.history.sort((a, b) => a.time > b.time);
          }

          cells[cellId] = convertedCell;
        });
      });

      tableData.data = data;
    } else {
      tableData.data = initialTable().data;
    }

    return tableData;
  }
}

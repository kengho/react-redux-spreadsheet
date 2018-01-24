import { fromJS, Map } from 'immutable';
import Papa from 'papaparse';
import uuid from 'uuid/v4';

import * as convertFormats from './convertFormats';

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

// Using in containers/Dialog/SettingsDialog.jsx.
export const initialSettings = {
  autoSaveHistory: true,
  tableHasHeader: false,
  spreadsheetName: 'Spreadsheet',
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
      detachments: {
        currentCellValue: null,
      },
      landing: {
        messages: [],
        buttonIsDisabled: false,
      },
      meta: {
        shortId: null,
        sync: true,
      },
      requests: {
        queue: [],
        counter: 0,
      },
      table,
      settings: initialSettings,
      ui: {
        current: {
          visibility: false,
          kind: null,
          place: null,
          cellId: null,
          variant: null, // Dialog
          disableYesButton: null, // Dialog
          errors: [], // Dialog
        },
        tableMenu: {
          disableNewSpreadsheetButton: null,
          newSpreadsheetPath: null,
        },
      },
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

const convertDataToArray = (data, cellCallback) => {
  const table = [];
  const rows = data.get('rows');
  const columns = data.get('columns');
  const cells = data.get('cells');
  const croppedSize = getCroppedSize(data);

  for (let rowIterator = 0; rowIterator < croppedSize[0]; rowIterator += 1) {
    const row = [];
    for (let columnIterator = 0; columnIterator < croppedSize[1]; columnIterator += 1) {
      const currentCellId = getCellId(
        rows.getIn([rowIterator, 'id']),
        columns.getIn([columnIterator, 'id'])
      );
      const currentCell = cells.get(currentCellId);

      row.push(cellCallback(currentCell));
    }

    table.push(row);
  }

  return table;
};

const convertArrayToData = (array, cellCallback) => {
  if (array.length === 0) {
    return initialTable().data;
  }

  const dataArrayRowsNumber = array.length;
  const dataArrayColumnsNumber = array[0].length;

  const data = initialTable(dataArrayRowsNumber, dataArrayColumnsNumber).data;
  const rows = data.rows;
  const columns = data.columns;
  const cells = data.cells;

  array.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const cellId = getCellId(rows[rowIndex].id, columns[columnIndex].id);
      const callbackedCell = cellCallback(cell);
      if (callbackedCell) {
        cells[cellId] = callbackedCell;
      }
    });
  });

  return data;
};

// Build-in format, doesn't needed to be exported.
const APP = 'APP';

export function convert(args) {
  const {
    data,
    settings,
  } = args;

  let {
    inputFormat,
    outputFormat,
  } = args;
  inputFormat = inputFormat || APP;
  outputFormat = outputFormat || APP;

  if (inputFormat === APP) {
    // APP => CSV
    if (outputFormat === convertFormats.CSV) {
      const dataArray = convertDataToArray(
        data,
        (cell) => cell ? cell.get('value') : ''
      );

      return Papa.unparse(dataArray);
    // APP => JSON
    } else if (outputFormat === convertFormats.JSON) {
      const dataArray = convertDataToArray(
        data,
        (appCell) => {
          let jsonCell = {};
          if (appCell) {
            const cellValue = appCell.get('value');
            if (cellValue && cellValue !== '') {
              jsonCell.value = cellValue;
            }
            if (appCell.get('history')) {
              jsonCell.history = appCell.get('history').map((record) => {
                // 1513645323000
                // =>
                // 2017-12-19T01:02:03.000Z
                const time = new Date(record.get('time')).toISOString();

                return {
                  time,
                  value: record.get('value'),
                };
              });
            }
          }

          return jsonCell;
        }
      );

      return JSON.stringify({
        version: '1',
        data: dataArray,
        settings,
      });
    }
  // CSV => APP
  } else if (inputFormat === convertFormats.CSV) {
    const CSVdata = data;
    const parsedCSV = Papa.parse(CSVdata);
    const parsedCSVArray = parsedCSV.data;
    const tableData = {};
    if (parsedCSV.errors){
      tableData.errors = parsedCSV.errors;
    };

    const appData = convertArrayToData(
      parsedCSVArray,
      (cell) => cell.length === 0 ? null : { value: cell }
    ) || initialTable().data;

    tableData.data = appData;

    return tableData;
  // JSON => APP
  } else if (inputFormat === convertFormats.JSON) {
    const JSONData = data;
    const tableData = {};
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(JSONData);
    } catch(err) {
      tableData.errors = [{
        code: err.name,
        message: `${err.name}: ${err.message}`,
      }];
    }

    if (parsedJSON) {
      const JSONVersion = parsedJSON.version;
      const parsedJSONArray = parsedJSON.data;

      let appData;
      switch (JSONVersion) {
        case '1': {
          appData = convertArrayToData(
            parsedJSONArray,
            (jsonCell) => {
              if (Object.keys(jsonCell).length === 0) {
                return;
              }

              const appCell = { ...jsonCell };
              if (jsonCell.history) {
                appCell.history = jsonCell.history.map((record, recordIndex) => {
                  // 2017-12-19T01:02:03.000Z
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
                appCell.history.sort((a, b) => a.time > b.time);
              }

              return appCell;
            }
          );
          tableData.data = appData;
          tableData.settings = parsedJSON.settings;
          break;
        }

        default:
      }
    } else {
      const newState = initialState();
      tableData.data = newState.getIn(['table', 'data']);
      tableData.settings = newState.getIn(['settings']);
    }

    return tableData;
  }
}

import { fromJS, Map, List } from 'immutable';
import uuid from 'uuid/v4';

import getSufficientState from './lib/getSufficientState';

import {
  APP,
  COLUMN,
  CSV,
  JSON_FORMAT,
  ROW,
  FORWARD,
  BACKWARD,
  BEGIN,
  END,
} from './constants';

if (process.env.NODE_ENV !== 'test') {
  window.log = (x) => console.log(JSON.stringify(x, null, 2));
}

export function composeLine({
  lineType,
  cellsNumber = 0,
  size = null,
  index = null,
}) {
  let id;
  if (process.env.NODE_ENV === 'test') {
    id = index;
  } else {
    id = uuid();
  }

  const line = {
    id,
    size,
  };

  if (lineType === ROW) {
    line.cells = Array.from(Array(cellsNumber)).map(() => composeCell());
  }

  return fromJS(line);
}

export function composeCell() {
  return Map({});
}

export function composeRow({
    size = null,
    index = null,
    cellsNumber = 0,
} = {}) {
  return composeLine({
    lineType: ROW,
    index,
    size,
  }).set(
    'cells',
    List(Array.from(Array(cellsNumber)).map(() => composeCell()))
  );
}

// NOTE: Legend:
//   size - visible size of something; pixels
//   offset - offset of something from coordinates begginning; pixels
//   index - position of some element in ordeled list; positive integer number
//   length - number of elements between one and the other (last not included); positive integer number
//   anchor - "begin" or "end" point of something 2d
export function initialTable() {
  const table = {
    // NOTE: changing major branch props forces Table to rerender.
    //   Everywhere in reducers table has major and minor branches,
    //   and everywhere in components it have only major (aka just "table").
    major: {
      layout: {
        [ROW]: {
          defaultSize: 40,
          marginSize: 30,
          list: [],
          // [
          //   {
          //     id,
          //     size,
          //     cells: [{}, ...],
          //     // cell:
          //     // { value: 2, history: [{ value: '1', date: 123123123 }, ...] }
          //   },
          //   ...
          // ]
          // //  see composeRow()
        },
        [COLUMN]: {
          defaultSize: 60,
          marginSize: 50,
          list: [],
          // [
          //   {
          //     id,
          //     size,
          //   },
          //   ...
          // ]
          // // see composeLine()
        },
      },
      session: {
        pointer: {
          [ROW]: {
            index: 0,
            size: null,
          },
          [COLUMN]: {
            index: 0,
            size: null,
          },
          value: '',
          edit: false,
          selectOnFocus: false,
        },
        clipboard: {
          [ROW]: {
            index: null,
            length: null,
          },
          [COLUMN]: {
            index: null,
            length: null,
          },
          cells: null, // see layout's cells, here we just have a full copy of some range from there
        },
        selection: {
          rectangles: [
            {
              [BEGIN]: null,
              // {
              //   [ROW]: {
              //     index: null,
              //   },
              //   [COLUMN]: {
              //     index: null,
              //   },
              // },

              [END]: null,
            },
          ],
        },
      },

      // NOTE: why vision is in table? In order to move pointer correctly with, say,
      //   PageUp, we should know screen size. In order to move pointer with Ctrl
      //   we should know table data (aka layout). So, because of pointer we can't
      //   separate vision and table (unless we want to get ugly middleware).
      //   In the end, it makes sense, because entire table view directly rely on vision.
      //   It also answers the question "why have vision in redux state at all" - vision is crucial.
      vision: {
        [ROW]: {
          scrollSize: 0,
          screenSize: window.innerHeight,
        },
        [COLUMN]: {
          scrollSize: 0,
          screenSize: window.innerWidth,
        },
      },
    },

    // NOTE: changing minor branch props not forces Table to rerender.
    minor: {
      linesOffsets: {
        [ROW]: [],
        [COLUMN]: [],
      },
    },
  };

  if (process.env.NODE_ENV !== 'test') {
    return fromJS(table);
  } else {
    const rowsSizes = [150, 200, 175, 200, 225, 200, 200, 150, 150, 200];
    const columnsSizes = [125, 150, 200, 150, 175, 125, 200, 150];
    const rowsList = rowsSizes.map((size, index) => {
      return composeRow({
        size,
        index,
        cellsNumber: columnsSizes.length,
      });
    });
    const columnsList = columnsSizes.map((size, index) => {
      return composeLine({
        lineType: COLUMN,
        size,
        index,
      });
    });
    const getLinesOffsets = (linesList) => {
      const offsets = [0];
      let currentOffset = offsets[0];
      let nextOffset;
      linesList.forEach((line, index) => {
        nextOffset = line.get('size') + currentOffset;
        offsets.push(nextOffset);
        currentOffset = nextOffset;
      });

      return offsets;
    };
    const rowsOffsets = getLinesOffsets(rowsList);
    const columnsOffsets = getLinesOffsets(columnsList);

    table.major.layout.ROW.defaultSize = 150;
    table.major.layout.COLUMN.defaultSize = 175;
    table.major.layout.ROW.marginSize = 100;
    table.major.layout.COLUMN.marginSize = 150;
    table.minor.linesOffsets.ROW = rowsOffsets;
    table.minor.linesOffsets.COLUMN = columnsOffsets;
    table.major.vision.ROW.screenSize = 1000;
    table.major.vision.COLUMN.screenSize = 800;

    return fromJS(table);
  }
}

// Using in containers/Dialog/SettingsDialog.jsx.
// TODO: make everything immutable by default.
export const initialSettings = Map({
  autoSaveHistory: true,
  tableHasHeader: false,
  spreadsheetName: 'Spreadsheet',
  // TODO: make hierarchy and put it here
  // renderParams: {
  //   rows: {
  //     gridRoundingLength: 3,
  //     overscanLength: 3, // word I learned from react-virtualized
  //     additionalScrollSize: 300, // lets you scroll faster through comp lines
  //   },
  //   columns: {
  //     gridRoundingLength: 3,
  //     overscanLength: 3,
  //     additionalScrollSize: 300,
  //   },
  // },
})

export function initialState() {
  const table = initialTable();

  let state;
  if (process.env.NODE_ENV !== 'test') {
    state = fromJS({
      landing: {
        messages: [],
      },
      server: {
        shortId: null,
        sync: null,
        requestFailed: false,
      },
      settings: initialSettings,
      table,
      ui: {
        popup: {
          visibility: false,
          place: null, // componentsNames, lineTypes
          kind: null, // uiKinds
          [ROW]: {
            index: null,
            offset: null,
          },
          [COLUMN]: {
            index: null,
            offset: null,
          },
        },
        dialog: {
          variant: null, // dialogVariants
          visibility: false,
        },
        search: {
          visibility: false,
          focus: false,
        },
      },
    });
  } else {
    state = Map({
      table: {
        past: [],
        present: fromJS(table),
        future: [],
      },
    });
  }

  return state;
}

// NOTE: all props are immutable.
export function findLastNonemptyAdjacentCell({
  layout,
  startingCell,
  lineType,
  direction, // directions
}) {
  const rows = layout.getIn([ROW, 'list']);
  const getCellValue = (cell) => {
    return rows.getIn(
      [cell[ROW].index, 'cells', cell[COLUMN].index, 'value'],
      ''
    );
  };
  const workingLines = layout.get(lineType);

  let result;
  let firstNonemptyCellSearchIndex;
  let stopSearchIndex;
  let indexIncrement;
  let loopCondition;
  let fallbackResult;
  switch (direction) {
    case FORWARD: {
      firstNonemptyCellSearchIndex = startingCell.getIn([lineType, 'index']);
      stopSearchIndex = workingLines.get('list').size - 1;
      indexIncrement = +1;
      loopCondition = (index) => (index <= stopSearchIndex);
      fallbackResult = startingCell.getIn([lineType, 'index']);

      break;
    }

    case BACKWARD: {
      firstNonemptyCellSearchIndex = startingCell.getIn([lineType, 'index']);
      stopSearchIndex = 0;
      indexIncrement = -1;
      loopCondition = (index) => (index >= stopSearchIndex);
      fallbackResult = 0;

      break;
    }

    default:
      break;
  }

  const currentCell = startingCell.toJS();
  const nextCell = startingCell.toJS();

  const currentValue = getCellValue(currentCell);
  let startSearchIndex;
  if (currentValue === '') {
    startSearchIndex = firstNonemptyCellSearchIndex;
  } else {
    for (
      let lineIndex = firstNonemptyCellSearchIndex;
      loopCondition(lineIndex);
      lineIndex += indexIncrement
    ) {
      currentCell[lineType].index = lineIndex;
      const currentValue = getCellValue(currentCell);
      if (currentValue !== '') {
        startSearchIndex = lineIndex;
        break;
      }
    }

    if (!Number.isInteger(startSearchIndex)) {
      return fallbackResult;
    }
  }

  // Main loop.
  for (
    let lineIndex = startSearchIndex;
    loopCondition(lineIndex);
    lineIndex += indexIncrement
  ) {
    currentCell[lineType].index = lineIndex;
    nextCell[lineType].index = lineIndex + indexIncrement;
    const currentValue = getCellValue(currentCell);
    const nextValue = getCellValue(nextCell);

    if (currentValue !== '' && nextValue === '' && lineIndex !== startSearchIndex) {
      result = lineIndex;
      break;
    }

    if (currentValue === '' && nextValue !== '') {
      result = lineIndex + indexIncrement;
      break;
    }
  }

  if (!Number.isInteger(result)) {
    result = fallbackResult;
  }

  return result;
}

// TODO: test.
export function isLineScrolledIntoView({
  size,
  offset,
  scrollSize,
  screenSize,
  marginSize,
}) {
  // NOTE: hanles situations when all things considered line is visible,
  //   but something (like, scrollbar) in a way. Also allows to set
  //   comfortable visible gap from bottom of the screen.
  const MAX_MARGIN_UNTIL_LINE_CONSIDERED_OUT_OF_VIEW_SIZE = 20;

  if (marginSize + offset < scrollSize) {
    return false;
  }

  if (scrollSize + screenSize <  marginSize + offset + size + MAX_MARGIN_UNTIL_LINE_CONSIDERED_OUT_OF_VIEW_SIZE) {
    return false;
  }

  return true;
}

export function getLineOffset({
  offsets,
  index,
  defaultSize,
}) {
  const maxOffsetsIndex = offsets.size - 1;

  // NOTE: though offsets shouldn't be empty, as tested in Grid,
  //   we return some number in case there are still error occur just
  //   not to fall into infinite loop in findLineByOffset().
  if (maxOffsetsIndex < 0) {
    return 0;
  }

  if (index <= maxOffsetsIndex) {
    return offsets.get(index);
  } else {
    const lastOffset = offsets.get(maxOffsetsIndex);
    const indexOverflow = index - maxOffsetsIndex;

    return lastOffset + defaultSize * indexOverflow;
  }
}

// TODO: PERF: (?) optimize algorithm. Use binary search
//   for real lines and simple arithmetics for comp ones.
//   Also remember not to optimize prematurely; there are
//   a lot of places in the codebase which are much worse.
export function findLineByOffset({
  offsets,
  startSearchIndex,
  stopSearchIndex,
  callback,
  defaultLineSize,
}) {
  let indexIncrement;
  let loopCondition;
  if (startSearchIndex < stopSearchIndex) {
    // TODO: PERF: startSearchIndex +-= 1 (perf, haha).
    indexIncrement = 1;
    loopCondition = (index) => (index <= stopSearchIndex);
  } else {
    indexIncrement = -1;
    loopCondition = (index) => (index >= stopSearchIndex);
  }

  for (
    let lineIndex = startSearchIndex;
    loopCondition(lineIndex);
    lineIndex += indexIncrement
  ) {
    const lineOffset = getLineOffset({
      offsets,
      index: lineIndex,
      defaultSize: defaultLineSize,
      // lastValue: // TODO: PERF: cache last value.
    });

    if (callback(lineOffset)) {
      return lineIndex;
    }
  }

  return stopSearchIndex; // in case callback condition is never met
}

// NOTE: this function uses in component, so table
//   has no minor and major branches, it's just "table".
export const convertTableToPlainArray = (
  table,
  cellCallback = (cell) => cell.get('value')
) => {
  const tableArray = [];
  const rowsSize = table.getIn(['layout', ROW, 'list']).size;
  const columnsSize = table.getIn(['layout', COLUMN, 'list']).size;
  for (let i = 0; i < rowsSize; i += 1) {
    const row = [];
    for (let j = 0; j < columnsSize; j += 1) {
      const currentCell = table.getIn(['layout', ROW, 'list', i, 'cells', j]);
      row.push(cellCallback(currentCell));
    }
    tableArray.push(row);
  }

  return tableArray;
};

const convertPlainArrayToState = (array, cellCallback) => {
  const state = initialState();
  let updatedState = state;

  array.forEach((arrayRow, rowIndex) => {
    let cells = [];
    arrayRow.forEach((value, columnIndex) => {
      const cell = cellCallback(value) || {};
      cells.push(cell);

      if (rowIndex === 0) {
        updatedState = updatedState.updateIn(
          ['table', 'major', 'layout', COLUMN, 'list'],
          (list) => list.push(composeLine({ lineType: COLUMN })),
        );
      }
    });

    let emptyStateRow = composeRow();
    const stateRow = emptyStateRow.set('cells', fromJS(cells));

    updatedState = updatedState.updateIn(
      ['table', 'major', 'layout', ROW, 'list'],
      (list) => list.push(stateRow),
    );
  });

  return updatedState;
};

export async function convert({
  serializedData,
  table,
  settings,
  inputFormat = APP,
  outputFormat,
}) {
  if (inputFormat === APP) {
    // APP => CSV
    if (outputFormat === CSV) {
      const tableArray = convertTableToPlainArray(
        table,
        (cell) => cell.get('value') || ''
      );

      const Papa = await import('papaparse');

      return Papa.unparse(tableArray);

    // APP => JSON
    } else if (outputFormat === JSON_FORMAT) {
      const layout = table.get('layout').toJS();

      // Convert history timestamps.
      layout[ROW].list.forEach((row, rowIndex) => {
        row.cells.forEach((cell, columnIndex) => {
          if (cell.history) {
            cell.history.forEach((record) => {
              const formattedTime = new Date(record.time).toISOString();
              record.time = formattedTime;
            });
          }
        });
      });

      return JSON.stringify({
        version: '2',
        ...getSufficientState({ table: layout, settings }),
      });
    }

  // CSV => APP
  } else if (inputFormat === CSV) {
    const CSVdata = serializedData;

    const Papa = await import('papaparse');
    const parsedCSV = Papa.parse(CSVdata);
    const result = {
      messages: parsedCSV.errors,
    };

    const state = convertPlainArrayToState(
      parsedCSV.data,
      (value) => value.length === 0 ? null : { value }
    );
    result.data = getSufficientState(state);

    return result;

  // JSON => APP
  } else if (inputFormat === JSON_FORMAT) {
    const JSONData = serializedData;
    const result = {};
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(JSONData);
    } catch(err) {
      result.messages = [`${err.name}: ${err.message}`];
    }

    if (parsedJSON) {
      switch (parsedJSON.version) {
        case '1': {
          const state = convertPlainArrayToState(
            parsedJSON.table,
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
          ).set(
            'settings',
            fromJS(parsedJSON.settings)
          );

          result.data = getSufficientState(state);

          break;
        }

        case '2': {
          const state = initialState().toJS();

          // TODO: fill lines' ids if there are none.

          // Convert history timestamps.
          state.table.major.layout = parsedJSON.table;
          state.table.major.layout[ROW].list.forEach((row, rowIndex) => {
            row.cells.forEach((cell, columnIndex) => {
              if (cell.history) {
                cell.history.forEach((record) => {
                  // 2017-12-19T01:02:03.000Z
                  // =>
                  // 1513645323000
                  // TODO: catch errors.
                  const time = new Date(record.time).getTime();
                  record.time = time;
                });

                cell.history.sort((a, b) => a.time > b.time);
              }
            });
          });
          state.setting = parsedJSON.settings;
          result.data = getSufficientState(fromJS(state));

          break;
        }

        default:
      }
    }

    return result;
  }
}

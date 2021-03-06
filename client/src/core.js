import uuid from 'uuid/v4';
import produce from 'immer';

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
  cellsValues = [],
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
    if (cellsValues.length > 0) {
      line.cells = cellsValues.map((value) => composeCell({ value }));
    } else {
      line.cells = Array.from(Array(cellsNumber)).map(() => composeCell());
    }
  }

  return (line);
}

export function composeCell(props = {}) {
  return props;
}

// NOTE: Legend:
//   size - visible size of something; pixels
//   offset - offset of something from coordinates begginning; pixels
//   index - position of some element in ordeled list; non-negative integer number
//   length - number of elements between one and the other (last not included); non-negative integer number
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
          // //  see composeLine()
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
          },
          [COLUMN]: {
            index: 0,
          },
          value: '',
          edit: false,
          selectOnFocus: false,
        },
        clipboard: [{
          boundary: {
            [ROW]: null,
            // {
            //   [BEGIN]: {
            //     index: null,
            //   },
            //   [END]: {
            //     index: null,
            //   },
            // },
            [COLUMN]: null,
          },
          rows: null, // slice from [ROW, 'list']
        }],
        selection: [{
          boundary: { // see clipboard boundary
            [ROW]: null,
            [COLUMN]: null,
          },
        }],
      },

      // NOTE: why vision is in table? In order to move pointer correctly with, say,
      //   PageUp, we should know screen size. In order to move pointer with Ctrl
      //   we should know table data (aka layout). So, because of pointer we can't
      //   separate vision and table (unless we want to get ugly middleware).
      //   In the end, it makes sense, because entire table view directly relies on vision.
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
      currentSelection: {
        visibility: false,
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
    },
  };

  if (process.env.NODE_ENV === 'test') {
    const rowsSizes = [150, 200, 175, 200, 225, 200, 200, 150, 150, 200];
    const columnsSizes = [125, 150, 200, 150, 175, 125, 200, 150];
    const rowsList = rowsSizes.map((size, index) => {
      return composeLine({
        size,
        index,
        cellsNumber: columnsSizes.length,
        lineType: ROW,
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
        nextOffset = line.size + currentOffset;
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
  }

  return (table);
}

// Using in containers/Dialog/SettingsDialog.jsx.
// TODO: make everything immutable by default.
// NOTE: review tests if you change default values.
export const initialSettings = {
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
}

export function initialState() {
  return {
    server: {
      errors: [],
      requestFailed: false,
      shortId: null,
      sync: null,
      syncInProgress: false,
    },
    settings: initialSettings,
    table: initialTable(),
    ui: {
      popup: {
        visibility: false,
        place: null, // componentsNames, lineTypes
        kind: null, // uiKinds
        cellProps: {
          [ROW]: {
            index: null,
            offset: null,
          },
          [COLUMN]: {
            index: null,
            offset: null,
          },
        },
      },
      dialog: {
        variant: null, // dialogVariants
        visibility: false,
      },
      searchBar: {
        visibility: false,
        focus: false,
      },
    },
  };
}

export function getSelectionBoundary(selection) {
  const boundary = {
    [ROW]: {
      [BEGIN]: null,
      [END]: null,
    },
    [COLUMN]: {
      [BEGIN]: null,
      [END]: null,
    },
  };

  if (selection[BEGIN][ROW].index < selection[END][ROW].index) {
    boundary[ROW][BEGIN] = selection[BEGIN][ROW];
    boundary[ROW][END] = selection[END][ROW];
  } else {
    boundary[ROW][BEGIN] = selection[END][ROW];
    boundary[ROW][END] = selection[BEGIN][ROW];
  }

  if (selection[BEGIN][COLUMN].index < selection[END][COLUMN].index) {
    boundary[COLUMN][BEGIN] = selection[BEGIN][COLUMN];
    boundary[COLUMN][END] = selection[END][COLUMN];
  } else {
    boundary[COLUMN][BEGIN] = selection[END][COLUMN];
    boundary[COLUMN][END] = selection[BEGIN][COLUMN];
  }

  return boundary;
}

// REVIEW: this probably could be simplified.
//   We're not grouping props in objects in order to take advantage
//   of PureComponent Cell (proven to be faster benchmarkably)
//   (see cellRenderer()).
export function getBoundaryProps(boundary, cellPosition) {
  if (boundary && boundary[ROW] && boundary[COLUMN]) {
    const rowInBoundary = (
      (cellPosition[ROW].index >= (boundary[ROW][BEGIN].index)) &&
      (cellPosition[ROW].index <= (boundary[ROW][END].index))
    );
    const columnInBoundary = (
      (cellPosition[COLUMN].index >= (boundary[COLUMN][BEGIN].index)) &&
      (cellPosition[COLUMN].index <= (boundary[COLUMN][END].index))
    );
    const isInBoundary = rowInBoundary && columnInBoundary;

    return {
      isInBoundary,
      isOnBoundaryTop: isInBoundary && (cellPosition[ROW].index === boundary[ROW][BEGIN].index),
      isOnBoundaryRight: isInBoundary && (cellPosition[COLUMN].index === boundary[COLUMN][END].index),
      isOnBoundaryBottom: isInBoundary && (cellPosition[ROW].index === boundary[ROW][END].index),
      isOnBoundaryLeft: isInBoundary && (cellPosition[COLUMN].index === boundary[COLUMN][BEGIN].index),
    };
  } else {
    return {
      isInBoundary: false,
      isOnBoundaryTop: false,
      isOnBoundaryRight: false,
      isOnBoundaryBottom: false,
      isOnBoundaryLeft: false,
    };
  }
}

// REVIEW: isn't it too complicated?
export function findLastNonemptyAdjacentCell({
  layout,
  startingCell,
  lineType,
  direction, // directions
}) {
  const rows = layout[ROW].list;
  const getCellValue = (cell) => {
    let cellValue;
    try {
      cellValue = rows[cell[ROW].index].cells[cell[COLUMN].index].value;
    } catch (e) {
      cellValue = '';
    }

    return cellValue || '';
  };
  const workingLines = layout[lineType];

  let result;
  let firstNonemptyCellSearchIndex;
  let stopSearchIndex;
  let indexIncrement;
  let loopCondition;
  let fallbackResult;
  switch (direction) {
    case FORWARD: {
      firstNonemptyCellSearchIndex = startingCell[lineType].index;
      stopSearchIndex = workingLines.list.length - 1;
      indexIncrement = +1;
      loopCondition = (index) => (index <= stopSearchIndex);
      fallbackResult = startingCell[lineType].index;

      break;
    }

    case BACKWARD: {
      firstNonemptyCellSearchIndex = startingCell[lineType].index;
      stopSearchIndex = 0;
      indexIncrement = -1;
      loopCondition = (index) => (index >= stopSearchIndex);
      fallbackResult = 0;

      break;
    }

    default:
      break;
  }

  // HACK: NOTE: cell is 2-level deep object, so naive Object.assign won't work properly.
  // REVIEW: really?
  const currentCell = JSON.parse(JSON.stringify(startingCell));
  const nextCell = JSON.parse(JSON.stringify(startingCell));

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

    if ((currentValue !== '') && (nextValue === '') && (lineIndex !== startSearchIndex)) {
      result = lineIndex;
      break;
    }

    if ((currentValue === '') && (nextValue !== '')) {
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
  // NOTE: handles situations when all things considered line is visible,
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
  const maxOffsetsIndex = offsets.length - 1;

  // NOTE: though offsets shouldn't be empty, as tested in Grid,
  //   we return some number in case there are still error occur just
  //   not to fall into infinite loop in findLineByOffset().
  if (maxOffsetsIndex < 0) {
    return 0;
  }

  if (index <= maxOffsetsIndex) {
    return offsets[index];
  } else {
    const lastOffset = offsets[maxOffsetsIndex];
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

  return stopSearchIndex; // in case callback condition was never met
}

// NOTE: this function uses in component, so table
//   has no minor and major branches, it's just "table".
export const convertTableToPlainArray = ({
  table,
  cellCallback = (cell) => {
    if (cell) {
      if (typeof cell.value === 'string') {
        return cell.value;
      } else {
        return null;
      }
    } else {
      throw new Error('Invalid "cell" in "convertTableToPlainArray()"');
    }
  },
}) => {
  const tableArray = [];
  const rowsSize = table.layout[ROW].list.length;
  const columnsSize = table.layout[COLUMN].list.length;
  for (let i = 0; i < rowsSize; i += 1) {
    const row = [];
    for (let j = 0; j < columnsSize; j += 1) {
      const currentCell = table.layout[ROW].list[i].cells[j];
      const plainCell = cellCallback(currentCell);
      row.push(plainCell);
    }
    tableArray.push(row);
  }

  return tableArray;
};

const convertPlainArrayToState = (array, cellCallback) => {
  const state = initialState();

  array.forEach((arrayRow, rowIndex) => {
    let cells = [];
    arrayRow.forEach((value, columnIndex) => {
      const cell = cellCallback(value) || {};
      cells.push(cell);

      if (rowIndex === 0) {
        state.table.major.layout[COLUMN].list.push(composeLine({ lineType: COLUMN }));
      }
    });

    let stateRow = composeLine({ lineType: ROW });
    stateRow.cells = cells;

    state.table.major.layout[ROW].list.push(stateRow);
  });

  return state;
};

// REVIEW: storing all this code in one function makes no sense, break it up.
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
      // TODO: test.
      const tableArray = convertTableToPlainArray({
        table,

        // Fail-proof callback.
        cellCallback: (cell) => (cell && cell.value) ? cell.value :  '',
      });

      const Papa = await import('papaparse');

      return Papa.unparse(tableArray);

    // APP => JSON
    } else if (outputFormat === JSON_FORMAT) {
      // Convert history timestamps.
      const convertedTable = produce(table.layout, draft => {
        draft[ROW].list.forEach((row, rowIndex) => {
          row.cells.forEach((cell, columnIndex) => {
            if (cell.history) {
              cell.history.forEach((record) => {
                const formattedTime = new Date(record.time).toISOString();
                record.time = formattedTime;
              });
            }
          });
        });
      });

      return JSON.stringify({
        version: '2',
        ...getSufficientState({ table: convertedTable, settings }),
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
        // NOTE: unable to test since v1 isn't using anywhere, better to ditch code.
        // case '1':

        case '2': {
          const state = initialState();

          // Checking data and converting history timestamps.
          // TODO: fill lines' ids if there are none.
          // TODO: check parsedJSON data format.
          state.table.major.layout = parsedJSON.table;
          state.table.major.layout[ROW].list.forEach((row, rowIndex) => {
            row.cells.forEach((cell, columnIndex) => {
              if (!cell) {
                cell = composeCell();
                row[columnIndex] = cell;
              }

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
          state.settings = parsedJSON.settings;
          result.data = getSufficientState(state);

          break;
        }

        default:
      }
    }

    return result;
  }
}

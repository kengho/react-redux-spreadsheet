import produce from 'immer';

import * as ActionTypes from '../actionTypes';
import {
  ROW,
  COLUMN,
  FORWARD,
  BACKWARD,
  ASCENDING,
  DESCENDING,
  BEGIN,
  END,
} from '../constants';
import {
  composeCell,
  composeLine,
  findLastNonemptyAdjacentCell,
  findLineByOffset,
  getLineOffset,
  initialState,
  initialTable,
  isLineScrolledIntoView,
  getSelectionBoundary,
} from '../core';

export default (state = initialState().table, action) => produce(state, draft => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case ActionTypes.UPDATE: {
      if (action.branch === 'table') {
        action.updater(draft);
      };
      break;
    }

    case ActionTypes.SET_PROP: {
      const rowIndex = action.cell[ROW].index;
      const columnIndex = action.cell[COLUMN].index;
      const targetRow = draft.major.layout[ROW].list[rowIndex];
      if (!targetRow) {
        break;
      }
      const targetCell = targetRow.cells[columnIndex];
      if (!targetCell) {
        break;
      }

      if (action.cell.value === undefined) {
        delete targetCell[action.cell.prop];
      } else {
        targetCell[action.cell.prop] = action.cell.value;
      }

      break;
    }

    case ActionTypes.SET_POINTER_PROPS: {
      Object
        .keys(action.pointerProps)
        .forEach((key) => draft.major.session.pointer[key] = action.pointerProps[key]);

      break;
    }

    case ActionTypes.SET_POINTER_POSITION: {
      let value;
      try {
        value = state
        .major
        .layout[ROW]
        .list[action.pointerPosition[ROW].index]
        .cells[action.pointerPosition[COLUMN].index]
        .value;
      } catch (e) {
        // test_804
        value = '';
      }

      Object.assign(draft.major.session.pointer, {...action.pointerPosition, value });
      break;
    }

    case ActionTypes.MOVE_POINTER: {
      const {
        key,
        altKey,
        ctrlKey,
        cell,
      } = action;

      const getLizeSize = (linesList, index, defaultLineSize) => {
        if (linesList[index]) {
          return linesList[index].size;
        } else {
          return defaultLineSize;
        }
      }

      // Figuring out what line type we are dealing with.

      let lineType;
      if (key) {
        if (
          key === 'ArrowUp' ||
          key === 'ArrowDown' ||
          (
            !altKey && (
              key === 'PageUp' ||
              key === 'PageDown'
            )
          )
        ) {
          lineType = ROW;
        } else if (
          key === 'ArrowLeft' ||
          key === 'ArrowRight' ||
          (
            altKey && (
              key === 'PageUp' ||
              key === 'PageDown'
            )
          )
        ) {
          lineType = COLUMN;
        } else {
          return state;
        }
      } else if (cell) {
        if (cell[ROW]) {
          lineType = ROW;
        } else if (cell[COLUMN]) {
          lineType = COLUMN;
        } else {
          return state;
        }
      } else {
        return state;
      }

      const linesList = state.major.layout[lineType];
      const defaultLineSize = state.major.layout[lineType].defaultSize;
      const linesOffsets = state.minor.linesOffsets[lineType];
      const screenSize = state.major.vision[lineType].screenSize;
      let marginSize = state.major.layout[lineType].marginSize;

      let documentScrollProp;
      if (lineType === ROW) {
        documentScrollProp = 'scrollTop';
      } else if (lineType === COLUMN) {
        documentScrollProp = 'scrollLeft';
      }

      const effectiveScreenSize = screenSize - marginSize;

      let direction;
      if (key) {
        if (
          key === 'ArrowDown' ||
          key === 'ArrowRight' ||
          key === 'PageDown'
        ) {
          direction = FORWARD;
        } else if (
          key === 'ArrowUp' ||
          key === 'ArrowLeft' ||
          key === 'PageUp'
        ) {
          direction = BACKWARD;
        } else {
          return state;
        }
      }

      // Main action.

      const scrollSize = state.major.vision[lineType].scrollSize;
      const currentLineIndex = state.major.session.pointer[lineType].index;
      const currentLineSize = getLizeSize(linesList, currentLineIndex, defaultLineSize);
      const currentLineOffset = getLineOffset({
        offsets: linesOffsets,
        index: currentLineIndex,
        defaultSize: defaultLineSize,
      });
      const isCurrentLineScrolledIntoView = isLineScrolledIntoView({
        size: currentLineSize,
        offset: currentLineOffset,
        scrollSize,
        screenSize,
        marginSize,
      });

      let nextLineIndex = currentLineIndex;

      if (key) {
        switch (key) {
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowRight':
          case 'ArrowLeft': {
            if (ctrlKey) {
              // NOTE: see tests for explanation how it works.
              nextLineIndex = findLastNonemptyAdjacentCell({
                layout: state.major.layout,
                startingCell: state.major.session.pointer,
                lineType,
                direction,
              });
            } else {
              switch (direction) {
                case FORWARD: {
                  nextLineIndex += 1;
                  break;
                }

                case BACKWARD: {
                  nextLineIndex -= 1;
                  break;
                }

                default:
              }
            }

            break;
          }

          case 'PageUp':
          case 'PageDown': {
            switch (direction) {
              case FORWARD:
              // NOTE: see tests for explanation how it works.
              nextLineIndex = findLineByOffset({
                offsets: linesOffsets,
                startSearchIndex: currentLineIndex,
                stopSearchIndex: Infinity,
                callback: (offset) => offset > (currentLineOffset + effectiveScreenSize),
                defaultLineSize,
              });

              // NOTE: line we're interested in is,
              //   previous one, which is still visible.
              nextLineIndex -= 1;
              break;

              case BACKWARD:
              nextLineIndex = findLineByOffset({
                offsets: linesOffsets,
                startSearchIndex: currentLineIndex,
                stopSearchIndex: 0,
                callback: (offset) => offset < (currentLineOffset + currentLineSize - effectiveScreenSize),
                defaultLineSize,
              });
              break;

              default:
            }

            break;
          }

          default:
        }
      } else if (cell) {
        nextLineIndex = cell[lineType].index;

        // HACK: if SearchBar is visible, next row (getting here),
        //   could become overlapped by it. There is no way to prevent
        //   this until "table" state branch knows about "ui", which
        //   is not going to happen. Another approach could be changing
        //   margin in "table" after calling openSearchBar() action,
        //   but it seems to be too complicated. Don't know how to solve it yet.
        if (lineType === ROW) {
          marginSize += 50;
        }
      } else {
        return state;
      }
      if (nextLineIndex < 0) {
        nextLineIndex = 0;
      }

      // Decide, whether we should scroll page.
      const nextLineSize = getLizeSize(linesList, nextLineIndex, defaultLineSize);
      const nextLineOffset = getLineOffset({
        offsets: linesOffsets,
        index: nextLineIndex,
        defaultSize: defaultLineSize,
      });
      const isNextLineScrolledIntoView = isLineScrolledIntoView({
        size: nextLineSize,
        offset: nextLineOffset,
        scrollSize,
        screenSize,
        marginSize,
      });
      if (isCurrentLineScrolledIntoView && !isNextLineScrolledIntoView) {
        let linesOffsetsDiff;
        if (nextLineIndex === 0) {
          // test_134
          linesOffsetsDiff = -document.documentElement[documentScrollProp]
        } else {
          linesOffsetsDiff = nextLineOffset - currentLineOffset;
        }

        draft.major.vision[lineType].scrollSize += linesOffsetsDiff;
      }
      if (!isCurrentLineScrolledIntoView && !isNextLineScrolledIntoView) {
        draft.major.vision[lineType].scrollSize = nextLineOffset;
      }

      // Finding out pointer value for EditingCell to show proper value.
      let nextRowIndex;
      let nextColumnIndex;
      if (lineType === ROW) {
        nextColumnIndex = state.major.session.pointer[COLUMN].index;
        nextRowIndex = nextLineIndex;
      } else {
        nextColumnIndex = nextLineIndex;
        nextRowIndex = state.major.session.pointer[ROW].index;
      }

      // TODO: use conditional chaining when possible.
      let nextPointerValue;
      try {
        nextPointerValue = state.major.layout[ROW].list[nextRowIndex].cells[nextColumnIndex].value;
      } catch (e) {
        nextPointerValue = null;
      }

      draft.major.session.pointer.value = nextPointerValue;
      draft.major.session.pointer[lineType].index = nextLineIndex;
      break;
    }

    // NOTE: could be called with just index within existing range without harm.
    case ActionTypes.INSERT_LINES: {
      const {
        lineType,
      } = action;

      let {
        index,
        number,
      } = action;

      // Assuming that if number is number we wanted "index" to be next last line,
      //   filling gap ("number") between it and current last line.
      if (number === undefined) {
        const currentLinesNumber = state.major.layout[lineType].list.length;
        const currentMaxLinesIndex = currentLinesNumber - 1;
        const expectedLinesNumber = index + 1;
        number = expectedLinesNumber - currentLinesNumber;
        index = currentMaxLinesIndex + 1;
      }

      if (number <= 0) {
        // TODO: TEST: check that this condition is tested.
        return state;
      }

      if (lineType === COLUMN) {
        // Compose and insert new cells into existing rows.
        const newCells = Array.from(Array(number)).map(() => composeCell());
        draft.major.layout[ROW].list.forEach((row) => {
          row.cells.splice(index, 0, ...newCells);
        });
      }

      // Prepare new lines.
      let composeLineArgs = {
        lineType,
      };
      if (lineType === ROW) {
        const columnsNumber = state.major.layout[COLUMN].list.length;
        composeLineArgs.cellsNumber = columnsNumber;
      }
      const newLines = (
        Array.from(Array(number)).map(
          (_, relativeLineIndex) => {
            if (process.env.NODE_ENV === 'test') {
              composeLineArgs.index = `${index}${relativeLineIndex}`
            }
            return composeLine(composeLineArgs);
          }
        )
      );

      draft.major.layout[lineType].list.splice(index, 0, ...newLines);
      break;
    }

    case ActionTypes.DELETE_LINES: {
      const {
        lineType,
        index,
        number,
      } = action;

      if (lineType === COLUMN) {
        // Delete cells from existing rows.
        draft.major.layout[ROW].list.forEach((row) => {
          row.cells.splice(index, number);
        });
      }

      // Delete lines.
      draft.major.layout[lineType].list.splice(index, number);
      break;
    }

    case ActionTypes.PUSH_CELL_HISTORY: {
      const rowIndex = action.cell[ROW].index;
      const columnIndex = action.cell[COLUMN].index;
      let cell;
      try {
        cell = draft.major.layout[ROW].list[rowIndex].cells[columnIndex];
      } catch (e) {
        return;
      }
      if (!cell) {
        return;
      }

      if (!cell.history) {
        cell.history = [];
      }

      const historyRecord = {
        time: action.time,
        value: action.value,
      };
      cell.history.push(historyRecord);

      break;
    }

    case ActionTypes.DELETE_CELL_HISTORY: {
      const rowIndex = action.cell[ROW].index;
      const columnIndex = action.cell[COLUMN].index;
      const cell = draft.major.layout[ROW].list[rowIndex].cells[columnIndex];

      if (Number.isInteger(action.historyIndex)) {
        cell.history.splice(action.historyIndex, 1);
      } else {
        cell.history = [];
      }

      break;
    }

    case ActionTypes.MERGE_SERVER_STATE: {
      draft.major.layout = action.serverState.table.major.layout;
      draft.major.session = initialTable().major.session;
      break;
    }

    case ActionTypes.FIXATE_CURRENT_SELECTION: {
      const currentSelection = state.minor.currentSelection;

      // Skip single-celled selections.
      if (
        currentSelection[BEGIN][ROW].index === currentSelection[END][ROW].index &&
        currentSelection[BEGIN][COLUMN].index === currentSelection[END][COLUMN].index
      ) {
        break;
      }

      const boundary = getSelectionBoundary(currentSelection);
      const filteredBoundary = {
        [ROW]: {},
        [COLUMN]: {},
      };
      [ROW, COLUMN].forEach((lineType) => {
        [BEGIN, END].forEach((anchorType) => {
          // Keep only index for everything else is already in the state.
          filteredBoundary[lineType][anchorType] = {
            index: boundary[lineType][anchorType].index,
          };
        });
      });

      draft.major.session.selection[0].boundary = filteredBoundary;
      break;
    }

    case ActionTypes.SET_SCROLL_SIZE: {
      draft.major.vision[ROW].scrollSize = action.scrollTop;
      draft.major.vision[COLUMN].scrollSize = action.scrollLeft;
      break;
    }

    // TODO: manage to put tableHasHeader to table branch somehow.
    case ActionTypes.SORT: {
      // NOTE: sorting only rows for now (corresponds to columns in terms of UI).
      if (action.lineType !== COLUMN) {
        return state;
      }

      // test_9322
      let firstRowId;
      try {
        firstRowId = state.major.layout[ROW].list[0].id;
      } catch (e) {
        firstRowId = ''
      }

      draft.major.layout[ROW].list.sort(
        (line1, line2) => {
          if (action.fixFirstLine) {
            if (line1.id === firstRowId) {
              return -1;
            } else if (line2.id === firstRowId) {
              return 1;
            }
          }

          const value1 = line1.cells[action.index].value;
          const value2 = line2.cells[action.index].value;
          switch (action.order) {
            case ASCENDING:
              return (value1 < value2) ? -1 : 1;
            case DESCENDING:
              return (value1 > value2) ? -1 : 1;
            default:
              return false;
          }
        }
      );
      break;
    }
  }
});

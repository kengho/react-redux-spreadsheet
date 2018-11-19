import {
  fromJS,
  List,
} from 'immutable';

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

// For dev.
process.clog = (x) => {
  if (process.logBelow) {
    process.log(x);
  }
};

const undefinedMerger = (oldVal, newVal) => newVal !== undefined ? newVal : oldVal;

// TODO: PERF: use withMutations.
//   https://facebook.github.io/immutable-js/docs/#/Map/withMutations

export default (state = initialState().get('table'), action) => {
  switch (action.type) {
    case ActionTypes.SET_IN:
      return state.setIn(action.path, fromJS(action.object));

    // TODO: explain.
    case ActionTypes.MERGE_IN: {
      const {
        defaults,
        object,
        path,
      } = action;

      return state.updateIn(
        path,
        (value) => value.mergeDeepWith(undefinedMerger, { ...defaults, ...object })
      );
    }

    case ActionTypes.DEFAULTIZE_IN:
      return state.setIn(
        action.path,
        initialState().getIn(['table', ...action.path])
      );

    case ActionTypes.SET_CELL: {
      const { [ROW]: _, [COLUMN]: __, ...cellProps } = action.cell;

      return state.setIn(
        [
          'major',
          'layout',
          ROW,
          'list',
          action.cell[ROW].index,
          'cells',
          action.cell[COLUMN].index,
        ],
        fromJS(cellProps),
      );
    }

    case ActionTypes.SET_PROP: {
      const cellPropPath = [
        'major',
        'layout',
        ROW,
        'list',
        action.cell[ROW].index,
        'cells',
        action.cell[COLUMN].index,
        action.cell.prop,
      ];

      if (action.cell.value === undefined) {
        return state.deleteIn(cellPropPath);
      } else {
        return state.setIn(cellPropPath, action.cell.value);
      }
    }

    case ActionTypes.SET_SCROLL_SIZE: {
      // NOTE: here we make two-way binding document.documentElement.scroll*
      //   and state: onScroll in Table fires this action, and dispatching
      //   this action leads to scroll changes.
      //
      //   In most browsers onScroll isn't fired if props are equal,
      //   no need to check it manually.
      document.documentElement.scrollTop = action.scrollSize[ROW].scrollSize;
      document.documentElement.scrollLeft = action.scrollSize[COLUMN].scrollSize;

      return state.updateIn(
        ['major', 'vision'],
        (value) => value.mergeDeep(action.scrollSize)
      );
    }

    case ActionTypes.SET_POINTER: {
      let value;
      if (action.pointer[ROW] && action.pointer[COLUMN]) {
        value = state.getIn(
          [
            'major',
            'layout',
            ROW,
            'list',
            action.pointer[ROW].index,
            'cells',
            action.pointer[COLUMN].index,
            'value',
          ],

          // test_804
          ''
        );
      }
      const mergingObject = {
        value,
        ...action.pointer,
      };

      return state.updateIn(
        ['major', 'session', 'pointer'],
        (value) => value.mergeDeepWith(undefinedMerger, mergingObject)
      );
    }

    case ActionTypes.MOVE_POINTER: {
      const {
        key,
        altKey,
        ctrlKey,
        cell,
      } = action;

      let workingPointerPath;
      let workingScrollPath;
      let linesList;
      let defaultLineSize;
      let linesOffsets;
      let screenSize;
      let direction;
      let marginSize;
      let documentScrollProp;

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

      // REVIEW: maybe get rid of this? Those are leftovers
      //   from revisions without lines-symmetrical state.
      workingPointerPath = ['major', 'session', 'pointer', lineType, 'index'];
      workingScrollPath = ['major', 'vision', lineType, 'scrollSize'];
      linesList = state.getIn(['major', 'layout', lineType, 'list']);
      defaultLineSize = state.getIn(['major', 'layout', lineType, 'defaultSize']);
      linesOffsets = state.getIn(['minor', 'linesOffsets', lineType]);
      screenSize = state.getIn(['major', 'vision', lineType, 'screenSize']);
      marginSize = state.getIn(['major', 'layout', lineType, 'marginSize']);
      if (lineType === ROW) {
        documentScrollProp = 'scrollTop';
      } else if (lineType === COLUMN) {
        documentScrollProp = 'scrollLeft';
      }

      const effectiveScreenSize = screenSize - marginSize;

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

      const scrollSize = state.getIn(workingScrollPath);
      const currentLineIndex = state.getIn(workingPointerPath);
      const currentLineSize = linesList.getIn([currentLineIndex, 'index'], defaultLineSize);
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
                layout: state.getIn(['major', 'layout']),
                startingCell: state.getIn(['major', 'session', 'pointer']),
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

      let nextState = state;

      // Decide, whether we should scroll page.
      const nextLineSize = linesList.getIn([nextLineIndex, 'index'], defaultLineSize);
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

        document.documentElement[documentScrollProp] += linesOffsetsDiff;
        nextState = state.updateIn(
          workingScrollPath,
          (value) => value + linesOffsetsDiff
        );
      }
      if (!isCurrentLineScrolledIntoView && !isNextLineScrolledIntoView) {
        document.documentElement[documentScrollProp] = nextLineOffset;
        nextState = state.setIn(
          workingScrollPath,
          nextLineOffset
        );
      }

      return nextState.setIn(workingPointerPath, nextLineIndex);
    }

    case ActionTypes.UPDATE_CELL_SIZE: {
      let nextState = state;
      [ROW, COLUMN].forEach((lineType) => {
        const lineSize = action.cellSize[lineType];
        if (!lineSize) {
          return;
        }

        const {
          index,
          size,
        } = lineSize;
        const lineSizePath = ['major', 'layout', lineType, 'list', index, 'size'];
        const currentLineSize = state.getIn(lineSizePath);
        if (currentLineSize < size) {
          nextState = nextState.setIn(lineSizePath, size);
        }
      });

      return nextState;
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
        const currentLinesNumber = state.getIn(['major', 'layout', lineType, 'list']).size;
        const currentMaxLinesIndex = currentLinesNumber - 1;
        const expectedLinesNumber = index + 1;
        number = expectedLinesNumber - currentLinesNumber;
        index = currentMaxLinesIndex + 1;
      }

      if (number <= 0) {
        return state;
      }

      let nextState = state;
      if (lineType === COLUMN) {
        // Compose and insert new cells into existing rows.
        const newCells = List(Array.from(Array(number)).map(() => composeCell()));
        nextState = nextState.updateIn(
          ['major', 'layout', ROW, 'list'],
          (value) => {
            return value.map((row) => {
              return row.update(
                'cells',
                (cells) => cells.splice(index, 0, ...newCells)
              );
            });
          }
        );
      }

      // Prepare new lines.
      let composeLineArgs = {
        lineType,
      };
      if (lineType === ROW) {
        const columnsNumber = state.getIn(['major', 'layout', COLUMN, 'list']).size;
        composeLineArgs.cellsNumber = columnsNumber;
      }
      const newLines = List(
        Array.from(Array(number)).map(
          (_, relativeLineIndex) => {
            if (process.env.NODE_ENV === 'test') {
              composeLineArgs.index = `${index}${relativeLineIndex}`
            }
            return composeLine(composeLineArgs);
          }
        )
      );

      // Insert new lines.
      nextState = nextState.updateIn(
        ['major', 'layout', lineType, 'list'],
        (value) => value.splice(index, 0, ...newLines)
      );

      return nextState;
    }

    // NOTE: don't merge it with INSERT_LINES, let code to be simple.
    case ActionTypes.DELETE_LINES: {
      const {
        lineType,
        index,
        number,
      } = action;

      let nextState = state;

      if (lineType === COLUMN) {
        // Delete cells from existing rows.
        nextState = nextState.updateIn(
          ['major', 'layout', ROW, 'list'],
          (value) => {
            return value.map((row) => {
              return row.update(
                'cells',
                (cells) => cells.splice(index, number)
              );
            });
          }
        );
      }

      // Delete lines.
      nextState = nextState.updateIn(
        ['major', 'layout', lineType, 'list'],
        (value) => value.splice(index, number)
      );

      return nextState;
    }

    case ActionTypes.PUSH_CELL_HISTORY: {
      let nextState = state;

      const rowIndex = action.cell[ROW].index;
      const columnIndex = action.cell[COLUMN].index;
      const historyPath = ['major', 'layout', ROW, 'list', rowIndex, 'cells', columnIndex, 'history'];

      if (!nextState.getIn(historyPath)) {
        nextState = nextState.setIn(
          historyPath,
          fromJS([])
        );
      }

      nextState = nextState.updateIn(
        historyPath,
        (value) => value.push(
          fromJS({
            time: action.time,
            value: action.value,
          })
        )
      );

      return nextState;
    }

    case ActionTypes.DELETE_CELL_HISTORY: {
      const rowIndex = action.cell[ROW].index;
      const columnIndex = action.cell[COLUMN].index;
      const historyPath = ['major', 'layout', ROW, 'list', rowIndex, 'cells', columnIndex, 'history'];

      return state.updateIn(
        historyPath,
        (value) => {
          if (Number.isInteger(action.historyIndex)) {
            return value.delete(action.historyIndex);
          } else {
            return fromJS([]);
          }
        }
      );
    }

    // NOTE: described areas should exist.
    case ActionTypes.DELETE_AREA: {
      return state.updateIn(
        ['major', 'layout', ROW, 'list'],
        (list) => list.map(
          (row, rowIndex) => {
            if (
              (rowIndex < action.area[ROW].index) ||
              (rowIndex >= action.area[ROW].index + action.area[ROW].length)
            ) {
              return row;
            } else {
              return row.update(
                'cells',
                (cells) => {
                  const before = cells.slice(0, action.area[COLUMN].index);
                  const after = cells.slice(action.area[COLUMN].index + action.area[COLUMN].length);
                  const newCells = List.of(
                    ...Array
                      .from(Array(action.area[COLUMN].length))
                      .map(() => composeCell())
                  );

                  return before.concat(newCells).concat(after);
                }
              )
            }
          }
        )
      );
    }

    // TODO: it's hard to read, need rewriting.
    // TODO: not all conditions tested for now.
    case ActionTypes.SET_AREA: {
      const {
        area,
        anchorCell,
      } = action;

      const areaRowsLength = area.size;
      const areaColumnsLength = area.getIn([0, 'cells']).size;

      let nextState = state;

      // Updating cells.
      return nextState.updateIn(
        ['major', 'layout', ROW, 'list'],
        (list) => list.map((row, rowIndex) => {
          const currentColumnsNumber = row.get('cells').size;
          const areaRelativeRowIndex = rowIndex - anchorCell[ROW].index;
          const cellsToSet = area.getIn([areaRelativeRowIndex, 'cells']);
          const shiftedColumnsLength = anchorCell[COLUMN].index + areaColumnsLength;
          let paddingRightLength = shiftedColumnsLength - currentColumnsNumber;

          let updatedRow = row;
          if (rowIndex < anchorCell[ROW].index) {
            if (paddingRightLength > 0) {
              const paddingRight = List.of(
                ...Array
                  .from(Array(paddingRightLength))
                  .map(() => composeCell())
              );

              updatedRow = row.update(
                'cells',
                (cells) => cells.concat(paddingRight)
              );
            }
          } else if (
              (rowIndex >= anchorCell[ROW].index) &&
              (rowIndex < anchorCell[ROW].index + areaRowsLength)
            ) {
            updatedRow = row.update(
              'cells',
              (cells) => {
                let before = cells.slice(0, anchorCell[COLUMN].index);
                const after = cells.slice(shiftedColumnsLength);

                paddingRightLength -= areaColumnsLength;
                if (paddingRightLength > 0) {
                  const paddingRight = List.of(
                    ...Array
                      .from(Array(paddingRightLength))
                      .map(() => composeCell())
                  );
                  before = before.concat(paddingRight);
                }

                return before.concat(cellsToSet).concat(after);
              }
            );
          }

          return updatedRow;
        })
      );
    }

    case ActionTypes.MERGE_SERVER_STATE: {
      const initialSession = initialTable().getIn(['major', 'session']);

      // TODO: in case of empty state mergeDeep() doesn't work as we would like,
      //   leaving  Lists inside layout as is instead of replacing them.
      //   Using this version until it is fugured out.
      //   Also, it can't wipe session data, so meybe this approach was
      //   failed by desing.
      return state.setIn(
        ['major', 'layout'],
        fromJS(action.serverState.table.major.layout)
      ).setIn(
        ['major', 'session'],
        initialSession
      );
    }

    case ActionTypes.FIXATE_CURRENT_SELECTION: {
      const currentSelection = state.getIn(['minor', 'currentSelection']);

      // Delete single-celled selections.
      if (
        (
          currentSelection.getIn([BEGIN, ROW, 'index']) ===
          currentSelection.getIn([END, ROW, 'index'])
        ) &&
        (
          currentSelection.getIn([BEGIN, COLUMN, 'index']) ===
          currentSelection.getIn([END, COLUMN, 'index'])
        )
      ) {
        return state;
      }

      const boundary = getSelectionBoundary(currentSelection);
      const filteredBoundary = {
        ROW: {},
        COLUMN: {},
      };
      [ROW, COLUMN].forEach((lineType) => {
        [BEGIN, END].forEach((anchorType) => {
          // Keep only index for everything else is already in the state.
          filteredBoundary[lineType][anchorType] = {
            index: boundary[lineType][anchorType].index,
          };
        });
      });

      return state.setIn(
        ['major', 'session', 'selection', 0, 'boundary'],
        fromJS(filteredBoundary)
      );
    }

    // TODO: manage to put tableHasHeader to table branch somehow.
    case ActionTypes.SORT: {
      // NOTE: sorting only rows for now (corresponds to columns in terms of UI).
      if (action.lineType !== COLUMN) {
        return state;
      }

      const firstRowId = state.getIn(['major', 'layout', ROW, 'list', 0, 'id']);

      return state.updateIn(
        ['major', 'layout', ROW, 'list'],
        (list) => list.sort(
          (line1, line2) => {
            if (action.fixFirstLine && line1.get('id') === firstRowId) {
              return false;
            }

            const value1 = line1.getIn(['cells', action.index, ...action.propPath], '');
            const value2 = line2.getIn(['cells', action.index, ...action.propPath], '');
            switch (action.order) {
              case ASCENDING:
                return value1 > value2;
              case DESCENDING:
                return value1 < value2;
              default:
                return false;
            }
          }
        )
      );
    }

    // HACK: after actions sequence SET_POINTER (edit: true), SET_PROP, (MOVE_POINTER)
    //   state with 'pointer.edit === true' adds to history, thus pressing Ctrl+Z
    //   enters Cell. But Ctrl+Z won't work while you are in Cell,
    //   and next Ctrl+Z won't work until you press Esc, which is uncomfortable.
    //   So, here we delete 'edit: true' from pointer's modifiers after undo/redo actions.
    // REVIEW: could it be done by undoable() filter or groupBy?
    //   We need to insert state without pointer to history somehow.
    case ActionTypes.UNDO:
    case ActionTypes.REDO: {
      // test_933
      // REVIEW: this.
      const scrollTop = state.getIn(['major', 'vision', ROW, 'scrollSize']);
      const scrollLeft = state.getIn(['major', 'vision', COLUMN, 'scrollSize']);
      document.documentElement.scrollTop = scrollTop;
      document.documentElement.scrollLeft = scrollLeft;

      return state.setIn(
        ['session', 'pointer', 'edit'],
        false
      );
    }

    default:
      return state;
  }
};

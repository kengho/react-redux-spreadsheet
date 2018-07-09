require('../setupTests');

import { expect } from 'chai';
import { fromJS, Map } from 'immutable';

import {
  ROW,
  COLUMN,
  ASCENDING,
  DESCENDING,
} from '../constants';
import * as Core from '../core';
// import * as SettingsActions from './settings';
import * as TableActions from './table';
import configureStore from '../store/configureStore';

const getPointer = (store) => store.getState().get('table').present.getIn(['major', 'session', 'pointer']);
const getTableLayout = (store) => store.getState().get('table').present.getIn(['major', 'layout']);
const getRowsList = (store) => store.getState().get('table').present.getIn(['major', 'layout', ROW, 'list']);
const getColumnsList = (store) => store.getState().get('table').present.getIn(['major', 'layout', COLUMN, 'list']);

const setCellsValues = (store, cellsArray) => {
  // Example for cellsArray:
  // const cellsArray = [
  //   ['00' , ''],
  //   ['' , '11'],
  // ];

  store.dispatch(TableActions.insertLines({ lineType: ROW, index: cellsArray.length - 1 }));
  store.dispatch(TableActions.insertLines({ lineType: COLUMN, index: cellsArray[0].length - 1 }));
  cellsArray.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      store.dispatch(TableActions.setProp({
        [ROW]: {
          index: rowIndex,
        },
        [COLUMN]: {
          index: columnIndex,
        },
        prop: 'value',
        value,
      }));
    });
  });

  return store;
}

describe('merge in', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);
  let object;
  let expectedPointer;

  it('should merge in if all args are present (using pointer as expample) and set default values', () => {
    process.logBelow = false;

    store.dispatch(TableActions.mergeIn(['major', 'session', 'pointer'], { value: null }));

    object = {
      [ROW]: {
        index: 1,
        size: 20,
      },
      [COLUMN]: {
        index: 2,
        size: 30,
      },
      edit: true,
      selectOnFocus: true,
    };
    store.dispatch(TableActions.mergeIn(['major', 'session', 'pointer'], object, { value: '' }));

    expectedPointer = fromJS({
      [ROW]: {
        index: 1,
        size: 20,
      },
      [COLUMN]: {
        index: 2,
        size: 30,
      },
      value: '',
      edit: true,
      selectOnFocus: true,
    });

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should merge in when not all args are present, leaving previous values', () => {
    process.logBelow = false;

    const object = {
      [ROW]: {
        index: 3,
      },
      value: 'asd',
      edit: false,
    };
    store.dispatch(TableActions.mergeIn(['major', 'session', 'pointer'], object));

    expectedPointer = fromJS({
      [ROW]: {
        index: 3,
        size: 20,
      },
      [COLUMN]: {
        index: 2,
        size: 30,
      },
      value: 'asd',
      edit: false,
      selectOnFocus: true,
    });

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });
});

describe('set pointer', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  let pointer;
  let expectedPointer;

  it('should set pointer if all args are present', () => {
    process.logBelow = false;

    pointer = {
      [ROW]: {
        index: 1,
        size: 20,
      },
      [COLUMN]: {
        index: 2,
        size: 30,
      },
      value: 'asd',
      edit: true,
      selectOnFocus: true,
    };
    store.dispatch(TableActions.setPointer(pointer));

    expectedPointer = fromJS({
      [ROW]: {
        index: 1,
        size: 20,
      },
      [COLUMN]: {
        index: 2,
        size: 30,
      },
      value: 'asd',
      edit: true,
      selectOnFocus: true,
    });

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });
});

describe('move pointer', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  const getPointerPosition = (store) => {
    const pointer = getPointer(store);
    return Map({
      rowIndex: pointer.getIn([ROW, 'index']),
      columnIndex: pointer.getIn([COLUMN, 'index']),
    });
  };

  describe('basic keys', () => {
    it('should move pointer with basic keys when available', () => {
      process.logBelow = false;
      // [b] - pointer before
      // [a] - pointer after
      //
      //    0   1
      // 0 [b] ...
      // 1 [a] ...
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 0 }));

      //    0   1
      // 0 ... ...
      // 1 [b] [a]
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 1 }));
      //
      //    0   1
      // 0 ... [a]
      // 1 ... [b]
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 1 }));

      //    0   1
      // 0 [a] [b]
      // 1 ... ...
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 0 }));
    });

    it('shouldn\'t move pointer with basic keys when unavailable', () => {
      process.logBelow = false;
      //    0
      // 0 [b]
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 0 }));

      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 0 }));
    });
  });

  describe('basic keys + ctrl', () => {
    process.logBelow = true;

    // Prepare state.
    // [xx] - pointer before
    // [a] - pointer after
    const cells = [
      //         pointer
      //           ↓
      ['' , ''  , '02', ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , '11', '12', '13', '' , '15' , '' , '17' , '18' , ''],
      ['' , ''  , '22', ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , ''  , ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , '42', ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , ''  , ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , '62', ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , '72', ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , ''  , ''  , '' , ''   , '' , ''   , ''   , ''],
      ['' , ''  , ''  , ''  , '' , ''   , '' , ''   , ''   , ''],
    ];
    setCellsValues(store, cells);

    it('should move pointer with basic keys + ctrl through rows when available', () => {
      process.logBelow = false;

      store.dispatch(TableActions.setPointer({
        [ROW]: {
          index: 0,
        },
        [COLUMN]: {
          index: 2,
        },
      }));

      // [xx] - pointer before
      // {xx} - pointer after
      //     2
      // 0 [02]
      // 1  12
      // 2 {22}
      // 3
      // 4  42
      // 5
      // 6  62
      // 7  72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 2, columnIndex: 2 }));

      //     2
      // 0  02
      // 1  12
      // 2 [22]
      // 3
      // 4 {42}
      // 5
      // 6  62
      // 7  72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 4, columnIndex: 2 }));

      //     2
      // 0  02
      // 1  12
      // 2  22
      // 3
      // 4 [42]
      // 5
      // 6 {62}
      // 7  72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 6, columnIndex: 2 }));

      //     2
      // 0  02
      // 1  12
      // 2  22
      // 3
      // 4  42
      // 5
      // 6 [62]
      // 7 {72}
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 7, columnIndex: 2 }));

      //     2
      // 0   02
      // 1   12
      // 2   22
      // 3
      // 4   42
      // 5
      // 6   62
      // 7 {[72]}
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowDown', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 7, columnIndex: 2 }));

      // Starting point for ArrowUp.
      store.dispatch(TableActions.setPointer({
        [ROW]: {
          index: 10, // out of real range
        },
        [COLUMN]: {
          index: 2,
        },
      }));

      //     2
      // 0   02
      // 1   12
      // 2   22
      // 3
      // 4   42
      // 5
      // 6   62
      // 7  {72}
      // 8
      // 9
      // 10 [  ]
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 7, columnIndex: 2 }));

      //     2
      // 0   02
      // 1   12
      // 2   22
      // 3
      // 4   42
      // 5
      // 6  {62}
      // 7  [72]
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 6, columnIndex: 2 }));

      //     2
      // 0   02
      // 1   12
      // 2   22
      // 3
      // 4  {42}
      // 5
      // 6  [62]
      // 7   72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 4, columnIndex: 2 }));

      //     2
      // 0   02
      // 1   12
      // 2  {22}
      // 3
      // 4  [42]
      // 5
      // 6   62
      // 7   72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 2, columnIndex: 2 }));

      //     2
      // 0  {02}
      // 1   12
      // 2  [22]
      // 3
      // 4   42
      // 5
      // 6   62
      // 7   72
      // 8
      // 9
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 2 }));

      // Border.
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 2 }));

      // Starting point for columns.
      store.dispatch(TableActions.setPointer({
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 0,
        },
      }));

      //     0    1  2  3  4  5  6  7  8  9
      // 1 [__] {11} 12 13 __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 1 }));

      //    0  1   2   3   4  5  6  7  8  9
      // 1 __ [11] 12 {13} __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 3 }));

      //    0  1  2  3   4   5   6  7  8  9
      // 1 __ 11 12 [13] __ {15} __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 5 }));

      //    0  1  2  3  4  5   6   7   8  9
      // 1 __ 11 12 13 __ [15] __ {17} 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 7 }));

      //    0  1  2  3  4  5  6  7    8   9
      // 1 __ 11 12 13 __ 15 __ [17] {18} __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 8 }));

      //    0  1  2  3  4  5  6  7   8    9
      // 1 __ 11 12 13 __ 15 __ 17 {[18]} __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 8 }));

      // Starting point for ArrowLeft.
      store.dispatch(TableActions.setPointer({
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 10, // out of real range
        },
      }));

      //    0  1  2  3  4  5  6  7  8   9   10
      // 1 __ 11 12 13 __ 15 __ 17 {18} __ [__]
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 8 }));

      //    0  1  2  3  4  5  6  7    8   9
      // 1 __ 11 12 13 __ 15 __ {17} [18] __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 7 }));

      //    0  1  2  3  4  5   6   7   8  9
      // 1 __ 11 12 13 __ {15} __ [17] 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 5 }));

      //    0  1  2  3   4   5   6  7  8  9
      // 1 __ 11 12 {13} __ [15] __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 3 }));

      //    0  1   2   3   4  5  6  7  8  9
      // 1 __ {11} 12 [13] __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 1 }));

      //     0    1  2  3  4  5  6  7  8  9
      // 1 {__} [11] 12 13 __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 0 }));

      // Border.
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 1, columnIndex: 0 }));

      // Reseting.
      store.dispatch(TableActions.setPointer({
        [ROW]: {
          index: 0,
        },
        [COLUMN]: {
          index: 0,
        },
      }));
    });


  });

  describe('numpad keys', () => {
    // TODO: restore pointer after each tests block (or before) like that.

    // 1 dot =~ 25 pixels, no gap between lines
    //
    // rows
    //   0      1       2      3        4       5       6      7     8      9     c10   c11   c12   c13
    // |150 || 200  || 175 || 200  ||  225  || 200  || 200  ||150 ||150 || 200  ||150 ||150 ||150 ||150 |
    // |----||------||-----||------||-------||------||------||----||----||------||----||----||----||----|
    // ........................................
    //            screen (1000)

    // columns
    //   0    1      2      3      4     5     6      7     c8     c9    c10     c11    c12
    // |125||150 || 200  ||150 || 175 ||125|| 200  ||150 || 175 || 175 || 175 || 175 || 175 |
    // |---||----||------||----||-----||---||------||----||-----||-----||-----||-----||-----|
    // ....................................
    //            screen (900)

    it('should move pointer with PageDown and PageUp when available', () => {
      process.logBelow = false;
      // General rule: get farthest at least partially hidden line on screen before/after current one.
      // (Assuming that the current line is entirely visibe.)
      //
      // [b] - pointer before
      // [a] - pointer after
      // +++ - margin
      //
      // rows
      //       0      1       2      3        4
      //     |150 || 200  || 175 || 200  ||  225  |
      //     |----||------||-----||------||-------|
      //       ↑                              ↑
      //      [b]                            [a]
      // ++++....................................
      //              screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageDown' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 4, columnIndex: 0 }));

      // rows
      //         4       5       6      7     8
      //     |  225  || 200  || 200  ||150 ||150 |
      //     |-------||------||------||----||----|
      //         ↑                            ↑
      //        [b]                          [a]
      // ++++....................................
      //            screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageDown' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 8, columnIndex: 0 }));

      // rows
      //       8      9     c10   c11   c12   c13
      //     |150 || 200  ||150 ||150 ||150 ||150 |
      //     |----||------||----||----||----||----|
      //       ↑                               ↑
      //      [b]                             [a]
      // ++++....................................
      //            screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageDown' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 13, columnIndex: 0 }));

      // rows
      //         8      9     c10   c11   c12   c13
      //       |150 || 200  ||150 ||150 ||150 ||150 |
      //       |----||------||----||----||----||----|
      //         ↑                               ↑
      //        [a]                             [b]
      //     ++++....................................
      //                    screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 8, columnIndex: 0 }));

      // rows
      //             4       5       6      7     8
      //         |  225  || 200  || 200  ||150 ||150 |
      //         |-------||------||------||----||----|
      //             ↑                            ↑
      //            [b]                          [b]
      //      ++++....................................
      //                  screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 4, columnIndex: 0 }));

      // rows
      //     0      1       2      3        4
      //   |150 || 200  || 175 || 200  ||  225  |
      //   |----||------||-----||------||-------|
      //     ↑                              ↑
      //    [a]                            [b]
      // ++++....................................
      //          screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 0 }));
    });

    it('shouldn\'t move pointer with PageUp when unavailable', () => {
      process.logBelow = false;
      // NOTE: moving pointer across columns just to be sure that there are no
      //   confusion between rows and columns in movePointer reducer.
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 0 }, [COLUMN]: { index: 10 }}));
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 10 }));
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 0 }, [COLUMN]: { index: 0 }}));
    });

    it('should move pointer with Alt+PageDown and Alt+PageUp when available', () => {
      process.logBelow = false;
      // columns
      //         0    1      2      3      4
      //       |125||150 || 200  ||150 || 175 |
      //       |---||----||------||----||-----|
      //         ↑                         ↑
      //        [b]                       [a]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageDown', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 4 }));

      // columns
      //          4     5     6      7     c8
      //       | 175 ||125|| 200  ||150 || 175 |
      //       |-----||---||------||----||-----|
      //          ↑                         ↑
      //         [b]                       [a]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageDown', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 8 }));

      // columns
      //         c8     c9     c10    c11    c12
      //       | 175 || 175 || 175 || 175 || 175 |
      //       |-----||-----||-----||-----||-----|
      //          ↑                    ↑
      //         [b]                  [a]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageDown', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 11 }));

      // columns
      //       c8     c9     c10    c11
      //     | 175 || 175 || 175 || 175 |
      //     |-----||-----||-----||-----|
      //        ↑                    ↑
      //       [a]                  [b]
      // ++++++..........................
      //          screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 8 }));

      // columns
      //    4     5     6      7     c8
      // | 175 ||125|| 200  ||150 || 175 |
      // |-----||---||------||----||-----|
      //    ↑                         ↑
      //   [a]                       [b]
      //  ++++++..........................
      //            screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 4 }));

      // columns
      //   0    1      2      3      4
      // |125||150 || 200  ||150 || 175 |
      // |---||----||------||----||-----|
      //        ↑                    ↑
      //       [b]                  [b]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 1 }));

      // Finally.
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 0, columnIndex: 0 }));
    });

    it('shouldn\'t move pointer with Alt+PageUp when unavailable', () => {
      process.logBelow = false;
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 10 }, [COLUMN]: { index: 0 }}));
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal(fromJS({ rowIndex: 10, columnIndex: 0 }));
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 0 }, [COLUMN]: { index: 0 }}));
    });
  });
});

describe('set prop', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  let args;

  // NOTE: we don't need this because expandTableLayout() should always
  //   come before setProp() and cell path should always exist.
  // it('shouldn\'t set prop if described cell don\'t exists', () => {
  //   process.logBelow = false;
  //   const tableBeforeDispatch = store.getState().get('table').present;
  //   store.dispatch(TableActions.setProp(args));
  //   const tableAfterDispatch = store.getState().get('table').present;
  //
  //   expect(tableAfterDispatch).to.deep.equal(tableBeforeDispatch);
  // });

  it('should set prop if described cell exists', () => {
    process.logBelow = false;

    // expected table
    //    0   1   2
    // 0 ... ... ...
    // 1 ... ... 12
    store.dispatch(TableActions.insertRows({ index: 1 }));
    store.dispatch(TableActions.insertColumns({ index: 2 }));

    args = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      prop: 'value',
      value: '12',
    };
    store.dispatch(TableActions.setProp(args));

    const cellValuePath = ['major', 'layout', ROW, 'list', 1, 'cells', 2, 'value'];
    const cellValue = store.getState().get('table').present.getIn(cellValuePath);

    expect(cellValue).to.equal('12');
  });

  it('should delete prop if undefined passed', () => {
    process.logBelow = false;

    args = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      prop: 'value',
      value: undefined,
    };
    store.dispatch(TableActions.setProp(args));

    const cellPath = ['major', 'layout', ROW, 'list', 1, 'cells', 2];
    const cell = store.getState().get('table').present.getIn(cellPath);

    expect(cell).to.equal(fromJS({}));
  });
});

describe('update cell size', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  //    00  01  02  03
  // 00 ... ... ... ...
  // 01 ... ... ... ...
  // 02 ... ... ... ...
  store.dispatch(TableActions.insertRows({ index: 2 }));
  store.dispatch(TableActions.insertColumns({ index: 3 }));

  let args;
  let expectedRowsList;
  let expectedColumnsList;

  it('should update cell size if there is no size yet', () => {
    process.logBelow = false;

    args = {
      [ROW]: {
        index: 1,
        size: 101,
      },
      [COLUMN]: {
        index: 2,
        size: 102,
      },
    };
    store.dispatch(TableActions.updateCellSize(args));

    expectedRowsList = fromJS([
      { id: '00', size: null, cells: [{}, {}, {}, {}] },
      { id: '01', size: 101, cells: [{}, {}, {}, {}] },
      { id: '02', size: null, cells: [{}, {}, {}, {}] },
    ]);
    expectedColumnsList = fromJS([
      { id: '00', size: null },
      { id: '01', size: null },
      { id: '02', size: 102 },
      { id: '03', size: null },
    ]);

    expect(getRowsList(store)).to.deep.equal(expectedRowsList);
    expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
  });

  it('should update row size if new size is bigger then current one', () => {
    process.logBelow = false;

    args = {
      [ROW]: {
        index: 1,
        size: 201,
      },
      [COLUMN]: {
        index: 2,
        size: 202,
      },
    };

    store.dispatch(TableActions.updateCellSize(args));

    expectedRowsList = fromJS([
      { id: '00', size: null, cells: [{}, {}, {}, {}] },
      { id: '01', size: 201, cells: [{}, {}, {}, {}] },
      { id: '02', size: null, cells: [{}, {}, {}, {}] },
    ]);
    expectedColumnsList = fromJS([
      { id: '00', size: null },
      { id: '01', size: null },
      { id: '02', size: 202 },
      { id: '03', size: null },
    ]);

    expect(getRowsList(store)).to.deep.equal(expectedRowsList);
    expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
  });

  it('shouldn\'t update row size if new size isn\'t bigger then current one', () => {
    process.logBelow = false;

    args = {
      [ROW]: {
        index: 1,
        size: 151,
      },
      [COLUMN]: {
        index: 2,
        size: 152,
      },
    };

    const tableLayoutBefore = getTableLayout(store);
    store.dispatch(TableActions.updateCellSize(args));
    const tableLayoutAfter = getTableLayout(store);

    expect(getRowsList(store)).to.deep.equal(expectedRowsList);
    expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
  });
});

describe('insert lines', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  let args;
  let expectedRowsList;
  let expectedColumnsList;

  describe('expand table layout', () => {
    it('should expand table layout by inserting lines in empty layout', () => {
      process.logBelow = false;

      store.dispatch(TableActions.insertRows({ index: 2 }));
      store.dispatch(TableActions.insertColumns({ index: 3 }));

      //    00  01  02  03
      // 00 +++ +++ +++ +++
      // 01 +++ +++ +++ +++
      // 02 +++ +++ +++ +++
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });

  describe('insert rows', () => {
    it('should insert 2 rows beside existing ones', () => {
      process.logBelow = false;

      args = {
        lineType: ROW,
        index: 1,
        number: 2,
      };
      store.dispatch(TableActions.insertLines(args));

      //     00  01  02  03
      // 00  ... ... ... ...
      // 10  +++ +++ +++ +++
      // 11  +++ +++ +++ +++
      // 01  ... ... ... ...
      // 02  ... ... ... ...
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '10', size: null, cells: [{}, {}, {}, {}] },
        { id: '11', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });

    it('should insert rows from last one to \'index\' if number not specified', () => {
      process.logBelow = false;

      args = {
        lineType: ROW,
        index: 5,
      };
      store.dispatch(TableActions.insertLines(args));

      //    00  01  02  03
      // 00 ... ... ... ...
      // 10 ... ... ... ...
      // 11 ... ... ... ...
      // 01 ... ... ... ...
      // 02 ... ... ... ...
      // 50 +++ +++ +++ +++
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '10', size: null, cells: [{}, {}, {}, {}] },
        { id: '11', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
        { id: '50', size: null, cells: [{}, {}, {}, {}] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });

  describe('insert columns', () => {
    it('should insert 3 columns beside existing ones', () => {
      process.logBelow = false;

      // Filling cells in order to see where new cells are inserted.
      for (let i = 0; i < 6; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          store.dispatch(TableActions.setProp({
            [ROW]: {
              index: i,
            },
            [COLUMN]: {
              index: j,
            },
            prop: 'v',
            value: `${i}${j}`,
          }));
        }
      }

      args = {
        lineType: COLUMN,
        index: 2,
        number: 3,
      };
      store.dispatch(TableActions.insertLines(args));

      //    00  01  20  21  22  02  03
      // 00 ... ... +++ +++ +++ ... ...
      // 10 ... ... +++ +++ +++ ... ...
      // 11 ... ... +++ +++ +++ ... ...
      // 12 ... ... +++ +++ +++ ... ...
      // 02 ... ... +++ +++ +++ ... ...
      // 50 ... ... +++ +++ +++ ... ...
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{ v: '00' }, { v: '01' }, {}, {}, {}, { v: '02' }, { v: '03' }] },
        { id: '10', size: null, cells: [{ v: '10' }, { v: '11' }, {}, {}, {}, { v: '12' }, { v: '13' }] },
        { id: '11', size: null, cells: [{ v: '20' }, { v: '21' }, {}, {}, {}, { v: '22' }, { v: '23' }] },
        { id: '01', size: null, cells: [{ v: '30' }, { v: '31' }, {}, {}, {}, { v: '32' }, { v: '33' }] },
        { id: '02', size: null, cells: [{ v: '40' }, { v: '41' }, {}, {}, {}, { v: '42' }, { v: '43' }] },
        { id: '50', size: null, cells: [{ v: '50' }, { v: '51' }, {}, {}, {}, { v: '52' }, { v: '53' }] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '20', size: null },
        { id: '21', size: null },
        { id: '22', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });

    it('should insert columns from last one to \'index\' if number not specified', () => {
      process.logBelow = false;

      args = {
        lineType: COLUMN,
        index: 8,
      };
      store.dispatch(TableActions.insertLines(args));

      //    00  01  20  21  22  02  03  70  71
      // 00 ... ... ... ... ... ... ... +++ +++
      // 10 ... ... ... ... ... ... ... +++ +++
      // 11 ... ... ... ... ... ... ... +++ +++
      // 12 ... ... ... ... ... ... ... +++ +++
      // 02 ... ... ... ... ... ... ... +++ +++
      // 50 ... ... ... ... ... ... ... +++ +++
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{ v: '00' }, { v: '01' }, {}, {}, {}, { v: '02' }, { v: '03' }, {}, {}] },
        { id: '10', size: null, cells: [{ v: '10' }, { v: '11' }, {}, {}, {}, { v: '12' }, { v: '13' }, {}, {}] },
        { id: '11', size: null, cells: [{ v: '20' }, { v: '21' }, {}, {}, {}, { v: '22' }, { v: '23' }, {}, {}] },
        { id: '01', size: null, cells: [{ v: '30' }, { v: '31' }, {}, {}, {}, { v: '32' }, { v: '33' }, {}, {}] },
        { id: '02', size: null, cells: [{ v: '40' }, { v: '41' }, {}, {}, {}, { v: '42' }, { v: '43' }, {}, {}] },
        { id: '50', size: null, cells: [{ v: '50' }, { v: '51' }, {}, {}, {}, { v: '52' }, { v: '53' }, {}, {}] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '20', size: null },
        { id: '21', size: null },
        { id: '22', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
        { id: '70', size: null },
        { id: '71', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });
});

describe('delete lines', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  store.dispatch(TableActions.insertRows({ index: 3 }));
  store.dispatch(TableActions.insertColumns({ index: 4 }));

  //    00  01  02  03  04
  // 00 ... ... ... ... ...
  // 01 ... ... ... ... ...
  // 02 ... ... ... ... ...
  // 03 ... ... ... ... ...

  let args;
  let expectedRowsList;
  let expectedColumnsList;

  describe('delete rows', () => {
    it('should delete 2 rows beside existing ones', () => {
      process.logBelow = false;

      args = {
        lineType: ROW,
        index: 1,
        number: 2,
      };
      store.dispatch(TableActions.deleteLines(args));

      //     00  01  02  03  04
      // 00  ... ... ... ... ...
      //     xxx xxx xxx xxx xxx
      //     xxx xxx xxx xxx xxx
      // 03  ... ... ... ... ...
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{}, {}, {}, {}, {}] },
        { id: '03', size: null, cells: [{}, {}, {}, {}, {}] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
        { id: '04', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });

  describe('delete columns', () => {
    it('should delete 3 columns beside existing ones', () => {
      process.logBelow = false;

      // Filling cells in order to see where new cells are inserted.
      for (let i = 0; i < 2; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          store.dispatch(TableActions.setProp({
            [ROW]: {
              index: i,
            },
            [COLUMN]: {
              index: j,
            },
            prop: 'v',
            value: `${i}${j}`,
          }));
        }
      }

      args = {
        lineType: COLUMN,
        index: 1,
        number: 3,
      };
      store.dispatch(TableActions.deleteLines(args));

      //     00  01  02  03  04
      // 00  ... xxx xxx xxx ...
      // 03  ... xxx xxx xxx ...
      expectedRowsList = fromJS([
        { id: '00', size: null, cells: [{ v: '00' }, { v: '04' }] },
        { id: '03', size: null, cells: [{ v: '10' }, { v: '14' }] },
      ]);
      expectedColumnsList = fromJS([
        { id: '00', size: null },
        { id: '04', size: null },
      ]);

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });
});

describe('cell history', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  store.dispatch(TableActions.insertRows({ index: 3 }));
  store.dispatch(TableActions.insertColumns({ index: 4 }));

  const cell = {
    [ROW]: {
      index: 1,
    },
    [COLUMN]: {
      index: 2,
    },
  };

  it('should create and push cell history', () => {
    store.dispatch(TableActions.setProp({ ...cell, prop: 'value', value: 'a' }));
    store.dispatch(TableActions.pushCellHistory(cell, 123, 'b'));
    store.dispatch(TableActions.pushCellHistory(cell, 124, 'c'));
    store.dispatch(TableActions.pushCellHistory(cell, 125, 'd'));
    store.dispatch(TableActions.pushCellHistory(cell, 126, 'e'));

    const expectedCellHistory = fromJS([
      {
        time: 123,
        value: 'b',
      },
      {
        time: 124,
        value: 'c',
      },
      {
        time: 125,
        value: 'd',
      },
      {
        time: 126,
        value: 'e',
      },
    ]);
    const actualCellHistory = store.getState().get('table').present.getIn(
      ['major', 'layout', ROW, 'list', 1, 'cells', 2, 'history']
    );

    expect(actualCellHistory).to.equal(expectedCellHistory);
  });

  it('should delete cell history', () => {
    store.dispatch(TableActions.deleteCellHistory(cell, 0));
    store.dispatch(TableActions.deleteCellHistory(cell, 1)); // former [2]

    const actualCellHistory = store.getState().get('table').present.getIn(
      ['major', 'layout', ROW, 'list', 1, 'cells', 2, 'history']
    );
    const expectedCellHistory = fromJS([
      {
        time: 124,
        value: 'c',
      },
      {
        time: 126,
        value: 'e',
      },
    ]);

    expect(actualCellHistory).to.equal(expectedCellHistory);
  });

  it('should delete cell all history if index is not specified', () => {
    store.dispatch(TableActions.deleteCellHistory(cell));

    const actualCellHistory = store.getState().get('table').present.getIn(
      ['major', 'layout', ROW, 'list', 1, 'cells', 2, 'history']
    );
    const expectedCellHistory = fromJS([]);

    expect(actualCellHistory).to.equal(expectedCellHistory);
  });
});

describe('sort', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  const cells = [
    ['10', '2'  , 'header'],
    ['00', 'ab' , ''],
    ['20', 'aa' , ''],
    ['30', ''   , ''],
    ['40', '1'  , ''],
    ['50', 'aaa', ''],
  ];
  setCellsValues(store, cells);

  let expectedCells;
  let actualCells;

  // TODO: test case with empty cells.

  it('should sort correctly in presense of header', () => {
    // store.dispatch(SettingsActions.setSettings({
    //   ...Core.initialSettings.toJS(),
    //   tableHasHeader: true,
    // }));

    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: ASCENDING,
      fixFirstLine: true,
    }));

    expectedCells = [
      ['10', '2'  , 'header'],
      ['30', ''   , ''],
      ['40', '1'  , ''],
      ['20', 'aa' , ''],
      ['50', 'aaa', ''],
      ['00', 'ab' , ''],
    ];
    actualCells = Core.convertTableToPlainArray(
      store.getState().get('table').present.get('major')
    );

    expect(actualCells).to.deep.equal(expectedCells);
  });

  it('should sort rows ascending', () => {
    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: ASCENDING,
    }));

    expectedCells = [
      ['30', ''   , ''],
      ['40', '1'  , ''],
      ['10', '2'  , 'header'],
      ['20', 'aa' , ''],
      ['50', 'aaa', ''],
      ['00', 'ab' , ''],
    ];
    actualCells = Core.convertTableToPlainArray(
      store.getState().get('table').present.get('major')
    );

    expect(actualCells).to.deep.equal(expectedCells);
  });

  it('should sort rows descending', () => {
    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: DESCENDING,
    }));

    expectedCells = [
      ['00', 'ab' , ''],
      ['50', 'aaa', ''],
      ['20', 'aa' , ''],
      ['10', '2'  , 'header'],
      ['40', '1'  , ''],
      ['30', ''   , ''],
    ];
    actualCells = Core.convertTableToPlainArray(
      store.getState().get('table').present.get('major')
    );

    expect(actualCells).to.deep.equal(expectedCells);
  });
});

import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import { setCellsValues, getPointer, getPointerPosition } from './utils';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('move pointer', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 0 });

      //    0   1
      // 0 ... ...
      // 1 [b] [a]
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 1 });

      //
      //    0   1
      // 0 ... [a]
      // 1 ... [b]
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 1 });

      //    0   1
      // 0 [a] [b]
      // 1 ... ...
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 0 });
    });

    it('shouldn\'t move pointer with basic keys when unavailable', () => {
      process.logBelow = false;
      //    0
      // 0 [b]
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 0 });

      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 0 });
    });
  });

  describe('basic keys + ctrl', () => {
    process.logBelow = false;

    // Prepare state.
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

    // Purposely messing with data in order to code work correctly with undefined values .
    store.dispatch(TableActions.setProp({
      [ROW]: {
        index: 3,
      },
      [COLUMN]: {
        index: 2,
      },
      prop: 'value',
      value: undefined,
    }));

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 2, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 4, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 6, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 7, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 7, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 7, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 6, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 4, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 2, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 2 });

      // Border.
      store.dispatch(TableActions.movePointer({ key: 'ArrowUp', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 2 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 1 });

      //    0  1   2   3   4  5  6  7  8  9
      // 1 __ [11] 12 {13} __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 3 });

      //    0  1  2  3   4   5   6  7  8  9
      // 1 __ 11 12 [13] __ {15} __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 5 });

      //    0  1  2  3  4  5   6   7   8  9
      // 1 __ 11 12 13 __ [15] __ {17} 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 7 });

      //    0  1  2  3  4  5  6  7    8   9
      // 1 __ 11 12 13 __ 15 __ [17] {18} __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 8 });

      //    0  1  2  3  4  5  6  7   8    9
      // 1 __ 11 12 13 __ 15 __ 17 {[18]} __
      store.dispatch(TableActions.movePointer({ key: 'ArrowRight', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 8 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 8 });

      //    0  1  2  3  4  5  6  7    8   9
      // 1 __ 11 12 13 __ 15 __ {17} [18] __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 7 });

      //    0  1  2  3  4  5   6   7   8  9
      // 1 __ 11 12 13 __ {15} __ [17] 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 5 });

      //    0  1  2  3   4   5   6  7  8  9
      // 1 __ 11 12 {13} __ [15] __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 3 });

      //    0  1   2   3   4  5  6  7  8  9
      // 1 __ {11} 12 [13] __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 1 });

      //     0    1  2  3  4  5  6  7  8  9
      // 1 {__} [11] 12 13 __ 15 __ 17 18 __
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 0 });

      // Border.
      store.dispatch(TableActions.movePointer({ key: 'ArrowLeft', ctrlKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 1, columnIndex: 0 });

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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 4, columnIndex: 0 });

      // rows
      //         4       5       6      7     8
      //     |  225  || 200  || 200  ||150 ||150 |
      //     |-------||------||------||----||----|
      //         ↑                            ↑
      //        [b]                          [a]
      // ++++....................................
      //            screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageDown' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 8, columnIndex: 0 });

      // rows
      //       8      9     c10   c11   c12   c13
      //     |150 || 200  ||150 ||150 ||150 ||150 |
      //     |----||------||----||----||----||----|
      //       ↑                               ↑
      //      [b]                             [a]
      // ++++....................................
      //            screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageDown' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 13, columnIndex: 0 });

      // rows
      //         8      9     c10   c11   c12   c13
      //       |150 || 200  ||150 ||150 ||150 ||150 |
      //       |----||------||----||----||----||----|
      //         ↑                               ↑
      //        [a]                             [b]
      //     ++++....................................
      //                    screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 8, columnIndex: 0 });

      // rows
      //             4       5       6      7     8
      //         |  225  || 200  || 200  ||150 ||150 |
      //         |-------||------||------||----||----|
      //             ↑                            ↑
      //            [b]                          [b]
      //      ++++....................................
      //                  screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 4, columnIndex: 0 });

      // rows
      //     0      1       2      3        4
      //   |150 || 200  || 175 || 200  ||  225  |
      //   |----||------||-----||------||-------|
      //     ↑                              ↑
      //    [a]                            [b]
      // ++++....................................
      //          screen (1000)
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 0 });
    });

    it('shouldn\'t move pointer with PageUp when unavailable', () => {
      process.logBelow = false;
      // NOTE: moving pointer across columns just to be sure that there are no
      //   confusion between rows and columns in movePointer reducer.
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 0 }, [COLUMN]: { index: 10 }}));
      store.dispatch(TableActions.movePointer({ key: 'PageUp' }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 10 });
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
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 4 });

      // columns
      //          4     5     6      7     c8
      //       | 175 ||125|| 200  ||150 || 175 |
      //       |-----||---||------||----||-----|
      //          ↑                         ↑
      //         [b]                       [a]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageDown', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 8 });

      // columns
      //         c8     c9     c10    c11    c12
      //       | 175 || 175 || 175 || 175 || 175 |
      //       |-----||-----||-----||-----||-----|
      //          ↑                    ↑
      //         [b]                  [a]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageDown', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 11 });

      // columns
      //       c8     c9     c10    c11
      //     | 175 || 175 || 175 || 175 |
      //     |-----||-----||-----||-----|
      //        ↑                    ↑
      //       [a]                  [b]
      // ++++++..........................
      //          screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 8 });

      // columns
      //    4     5     6      7     c8
      // | 175 ||125|| 200  ||150 || 175 |
      // |-----||---||------||----||-----|
      //    ↑                         ↑
      //   [a]                       [b]
      //  ++++++..........................
      //            screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 4 });

      // columns
      //   0    1      2      3      4
      // |125||150 || 200  ||150 || 175 |
      // |---||----||------||----||-----|
      //        ↑                    ↑
      //       [b]                  [b]
      // ++++++..........................
      //           screen (800)
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 1 });

      // Finally.
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 0, columnIndex: 0 });
    });

    it('shouldn\'t move pointer with Alt+PageUp when unavailable', () => {
      process.logBelow = false;
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 10 }, [COLUMN]: { index: 0 }}));
      store.dispatch(TableActions.movePointer({ key: 'PageUp', altKey: true }));
      expect(getPointerPosition(store)).to.deep.equal({ rowIndex: 10, columnIndex: 0 });
      store.dispatch(TableActions.setPointer({ [ROW]: { index: 0 }, [COLUMN]: { index: 0 }}));
    });
  });

  describe('side effects', () => {
    it('should set new appropriate pointer value', () => {
      process.logBelow = false;

      const cells = [
        ['00', '01'],
        ['10', '11'],
      ];
      setCellsValues(store, cells);

      store.dispatch(TableActions.movePointer({ key: 'ArrowDown' }));
      const expectedValue = '10';
      const actualValue = getPointer(store).value;
      expect(actualValue).to.equal(expectedValue);
    });
  });
});

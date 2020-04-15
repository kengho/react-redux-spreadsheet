import { expect } from 'chai';

import {
  getCellsValues,
  getSelection,
  setCellsValues,
} from './utils';
import { convertTableToPlainArray } from '../../core';
import {
  CLEAR,
  COLUMN,
  COPY,
  CUT,
  DELETE,
  PASTE,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('work on user specified area', () => {
  // Testing in regular workflow style.
  // Also here we neglecting details of realisation of clipboard,
  //   testing only relevant to renderer table's layout state.

  const state = Core.initialState();
  const store = configureStore(state);
  let expectedCellsValues;
  let actualCellsValues;

  describe('single-celled pointer', () => {
    it('shouldn\'t fail on empty spreadsheet', () => {
      process.logBelow = false;

      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 2,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(COPY));
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 0,
        },
        [COLUMN]: {
          index: 1,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

      expectedCellsValues = [[null, null]];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });

    it('should copy and paste pointed cell\'s value to another cell', () => {
      process.logBelow = false;

      const cells = [
        ['00', '01', '02'],
        ['10', '11', '12'],
      ];
      setCellsValues(store, cells);
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 2,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(COPY));
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 0,
        },
        [COLUMN]: {
          index: 1,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

      expectedCellsValues = [
        ['00', '12', '02'],
        ['10', '11', '12'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });

    it('should cut and paste pointed cell\'s value to another cell', () => {
      process.logBelow = false;

      store.dispatch(TableActions.workOnUserSpecifiedArea(CUT));
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 0,
        },
        [COLUMN]: {
          index: 2,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

      expectedCellsValues = [
        ['00', null, '12'],
        ['10', '11', '12'],
      ];
      actualCellsValues = getCellsValues(store);
      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });

    it('should clear cell\'s value at pointer', () => {
      process.logBelow = false;

      store.dispatch(TableActions.workOnUserSpecifiedArea(CLEAR));

      expectedCellsValues = [
        ['00', null, null],
        ['10', '11', '12'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });
  });

  it('should expand layout if necessary and keep clipboard content between actions', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setPointerPosition({
      [ROW]: {
        index: 2,
      },
      [COLUMN]: {
        index: 3,
      },
    }));
    store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

    expectedCellsValues = [
      ['00', null, null, null],
      ['10', '11', '12', null],
      [null, null, null, '12'],
    ];
    actualCellsValues = getCellsValues(store);
    expect(actualCellsValues).to.deep.equal(expectedCellsValues);
  });

  describe('selection', () => {
    it('should copy and paste on selection and then clear it', () => {
      process.logBelow = false;

      const cells = [
        ['00', '01', '02', '03'],
        ['10', '11', '12', '13'],
        ['20', '21', '22', '23'],
        ['30', '31', '32', '33'],
      ];
      setCellsValues(store, cells);

      // {} - clipboarded cells.
      // {{}} - next pointer.
      // <> - clipboarded cell's target.
      // [
      //   ['00', {'01'},  {'02'},  '03'],
      //   ['10', {'11'}, {{'12'}}, '13'],
      //   ['20',  '21',    '22',   '23'],
      //   ['30',  '31',    '32',   '33'],
      // ]
      // => (COPY PASTE)
      // [
      //   ['00', '01',     '02',   '03' ],
      //   ['10', '11',    <'12'>, <'13'>],
      //   ['20', '21',    <'22'>, <'23'>],
      //   ['30', '31',     '32',   '33' ],
      // ]
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: BEGIN,
        anchor: {
          [ROW]: {
            index: 0,
          },
          [COLUMN]: {
            index: 1,
          },
        },
      }));
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: END,
        anchor: {
          [ROW]: {
            index: 1,
          },
          [COLUMN]: {
            index: 2,
          },
        },
      }));
      store.dispatch(TableActions.fixateCurrentSelection());
      store.dispatch(TableActions.workOnUserSpecifiedArea(COPY));
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 2,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

      expectedCellsValues = [
        ['00', '01', '02', '03'],
        ['10', '11', '01', '02'],
        ['20', '21', '11', '12'],
        ['30', '31', '32', '33'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);

      const expectedSelection = [{
        boundary: {
          [ROW]: null,
          [COLUMN]: null,
        },
      }];
      expect(getSelection(store)).to.deep.equal(expectedSelection);
    });

    it('should cut and paste on selection and expand layout if necessary', () => {
      process.logBelow = false;

      // {} - clipboarded cells.
      // {{}} - next pointer.
      // <> - clipboarded cell's target.
      // [
      //   ['00', {'01'}, {'02'},   '03'  ],
      //   ['10', {'11'}, {'01'},   '02'  ],
      //   ['20',  '21',   '11',    '12'  ],
      //   ['30',  '31',   '32',  {{'33'}}],
      // ]
      // => (CUT PASTE)
      // [
      //   ['00',  null,   null,    '03',   null  ],
      //   ['10',  null,   null,    '02',   null  ],
      //   ['20',  '21',   '11',    '12',   null  ],
      //   ['30',  '31',   '32',   <'01'>, <'02'>],
      //   [null,  null,   null,   <'11'>, <'01'>],
      // ]
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: BEGIN,
        anchor: {
          [ROW]: {
            index: 0,
          },
          [COLUMN]: {
            index: 1,
          },
        },
      }));
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: END,
        anchor: {
          [ROW]: {
            index: 1,
          },
          [COLUMN]: {
            index: 2,
          },
        },
      }));
      store.dispatch(TableActions.fixateCurrentSelection());
      store.dispatch(TableActions.workOnUserSpecifiedArea(CUT));
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 3,
        },
        [COLUMN]: {
          index: 3,
        },
      }));
      store.dispatch(TableActions.workOnUserSpecifiedArea(PASTE));

      expectedCellsValues = [
        ['00', null, null, '03', null],
        ['10', null, null, '02', null],
        ['20', '21', '11', '12', null],
        ['30', '31', '32', '01', '02'],
        [null, null, null, '11', '01'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });


    it('should clear on selection', () => {
      process.logBelow = false;

      // {} - clipboarded cells.
      // <> - cleared cells.
      // [
      //   ['00', null,  null,   '03',  null],
      //   ['10', null, {null}, {'02'}, null],
      //   ['20', '21', {'11'}, {'12'}, null],
      //   ['30', '31', {'32'}, {'01'}, '02'],
      //   [null, null,  null,   '11',  '01'],
      // ]
      // => (CLEAR)
      // [
      //   ['00', null,  null,   '03',  null],
      //   ['10', null, <null>, <null>, null],
      //   ['20', '21', <null>, <null>, null],
      //   ['30', '31', <null>, <null>, '02'],
      //   [null, null,  null,   '11',  '01'],
      // ]
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: BEGIN,
        anchor: {
          [ROW]: {
            index: 1,
          },
          [COLUMN]: {
            index: 2,
          },
        },
      }));
      store.dispatch(TableActions.setCurrentSelectionAnchor({
        selectionAnchorType: END,
        anchor: {
          [ROW]: {
            index: 3,
          },
          [COLUMN]: {
            index: 3,
          },
        },
      }));
      store.dispatch(TableActions.fixateCurrentSelection());
      store.dispatch(TableActions.workOnUserSpecifiedArea(CLEAR));

      expectedCellsValues = [
        ['00', null, null, '03', null],
        ['10', null, null, null, null],
        ['20', '21', null, null, null],
        ['30', '31', null, null, '02'],
        [null, null, null, '11', '01'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });
  });

  describe('system clipboard', () => {
    it('should paste multiline \t-separated text from system clipboard if there\'s no app clipboard', () => {
      process.logBelow = false;

      // {} - pointed cell.
      // <> - affected cells.
      // [
      //   ['00',  null,    null,   '03',   null],
      //   ['10',  null,    null,   null,   null],
      //   ['20', {'21'},   null,   null,   null],
      //   ['30',  '31',    null,   null,   '02'],
      //   [null,  null,    null,   '11',   '01'],
      // ]
      // => (PASTE from system clipboard)
      // [
      //   ['00',  null,    null,   '03',   null ],
      //   ['10',  null,    null,   null,   null ],
      //   ['20', <'c1'>,  <'c2'>, <'c3'>,  null ],
      //   ['30', <'c4'>,  <'c5'>,  null,   '02' ],
      //   [null, <'c6'>,  <'c7'>, <'c8'>, <'c9'>],
      // ]
      // Text:
      // c1	c2	c3
      // c4	5
      // c6	c7	c8	c9
      const systemClipboardText = "c1\tc2\tc3\nc4\tc5\nc6\tc7\tc8\tc9";
      store.dispatch(TableActions.setPointerPosition({
        [ROW]: {
          index: 2,
        },
        [COLUMN]: {
          index: 1,
        },
      }));
      store.dispatch(TableActions.pasteUserSpecifiedArea(systemClipboardText));

      expectedCellsValues = [
        ['00', null, null, '03', null],
        ['10', null, null, null, null],
        ['20', 'c1', 'c2', 'c3', null],
        ['30', 'c4', 'c5', null, '02'],
        [null, 'c6', 'c7', 'c8', 'c9'],
      ];
      actualCellsValues = getCellsValues(store);

      // Clipboard wasn't cleared, so system clipboard shouldn't be pasted yet.
      //   (Note that previous clipboard 2x2 size entirely fits new system clipboard.)
      expect(actualCellsValues).not.to.deep.equal(expectedCellsValues);

      store.dispatch(TableActions.clearClipboard());
      store.dispatch(TableActions.pasteUserSpecifiedArea(systemClipboardText));
      actualCellsValues = getCellsValues(store);

      // Now it should.
      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });

    it('should paste single-lined text from system clipboard', () => {
      process.logBelow = false;

      // {} - pointed cell.
      // <> - affected cells.
      // [
      //   ['00',  null,    null,   '03',  null],
      //   ['10',  null,    null,   null,  null],
      //   ['20', {'c1'},   'c2',   'c3',  null],
      //   ['30',  'c4',    'c5',   null,  '02'],
      //   [null,  'c6',    'c7',   'c8',  'c9'],
      // ]
      // => (PASTE from system clipboard)
      // [
      //   ['00',  null,    null,   '03',  null],
      //   ['10',  null,    null,   null,  null],
      //   ['20', <'ca'>,  <'cb'>, <'cc'>, null],
      //   ['30',  'c4',   'c5',    null,  '02'],
      //   [null,  'c6',   'c7',    'c8',  'c9'],
      // ]
      // Text:
      // ca	cb	cc
      const systemClipboardText = "ca\tcb\tcc";
      store.dispatch(TableActions.pasteUserSpecifiedArea(systemClipboardText));

      expectedCellsValues = [
        ['00', null, null, '03', null],
        ['10', null, null, null, null],
        ['20', 'ca', 'cb', 'cc', null],
        ['30', 'c4', 'c5', null, '02'],
        [null, 'c6', 'c7', 'c8', 'c9'],
      ];
      actualCellsValues = getCellsValues(store);

      expect(actualCellsValues).to.deep.equal(expectedCellsValues);
    });
  });
});

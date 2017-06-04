/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
import { expect } from 'chai';

import * as Core from '../core';

describe('core', () => {
  it('get rowId and columnId by cellId', () => {
    expect(Core.getRowId('r1,c1')).to.equal('r1');
    expect(Core.getColumnId('r1,c1')).to.equal('c1');
  });

  it('get cellId by rowId and columnId', () => {
    expect(Core.getCellId('r1', 'c1')).to.equal('r1,c1');
  });

  it('get rowNumber and columnNumber', () => {
    expect(Core.getRowNumber([0, 1])).to.equal(0);
    expect(Core.getColumnNumber([0, 1])).to.equal(1);
  });

  it('return initial lines (rows and columns)', () => {
    const expectedInitialLines = {
      rows: ['r0', 'r1', 'r2'],
      columns: ['c0', 'c1', 'c2',  'c3'],
    };

    expect(Core.initialLines(3, 4)).to.deep.equal(expectedInitialLines);
  });


  it('return initial table', () => {
    const expectedInitialTable = {
      data: {
        ...Core.initialLines(3, 4),
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
        }
      },
      updateTriggers: {
        data: {
          rows: {},
        },
      },
    };

    expect(Core.initialTable(3, 4)).to.deep.equal(expectedInitialTable);
  });

  it('get line ref', () => {
    expect(Core.getLineRef([-1, 2])).to.equal('COLUMN');
    expect(Core.getLineRef([2, -1])).to.equal('ROW');
  });

  it('get maximum pos in table', () => {
    const rows = ['r0', 'r1', 'r2'];
    const columns = ['c0', 'c1', 'c2',  'c3'];

    expect(Core.getMaxPos(rows, columns)).to.deep.equal([2, 3]);
  });

  it('get position after key pressed', () => {
    const rows = ['r0', 'r1', 'r2'];
    const columns = ['c0', 'c1', 'c2',  'c3'];

    expect(Core.calcNewPos(rows, columns, null,   'ArrowUp')).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [1, 2], 'ArrowUp')).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [0, 2], 'ArrowUp')).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(rows, columns, null,   'PageUp')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'PageUp')).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [0, 2], 'PageUp')).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(rows, columns, null,   'ArrowDown')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [0, 2], 'ArrowDown')).to.deep.equal([1, 2]); // OK

    expect(Core.calcNewPos(rows, columns, null,   'PageDown')).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [0, 2], 'PageDown')).to.deep.equal([2, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 2], 'PageDown')).to.deep.equal([2, 2]); // border

    expect(Core.calcNewPos(rows, columns, null,   'ArrowLeft')).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'ArrowLeft')).to.deep.equal([2, 1]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 0], 'ArrowLeft')).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(rows, columns, null,   'Home')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'Home')).to.deep.equal([2, 0]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 0], 'Home')).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(rows, columns, null,   'ArrowRight')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'ArrowRight')).to.deep.equal([2, 3]); // OK

    expect(Core.calcNewPos(rows, columns, null,   'End')).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 1], 'End')).to.deep.equal([2, 3]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 3], 'End')).to.deep.equal([2, 3]); // border
  });

  it('return are props equal in two objects (sting, true)', () => {
    const currentProps = { a: 1, b: 2, c: 3 };
    const nextProps = { a: 1, b: 2, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(true);
  });

  it('return are props equal in two objects (sting, false)', () => {
    const currentProps = { a: 1, b: 2, c: 3 };
    const nextProps = { a: 1, b: 3, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(false);
  });

  it('return are props equal in two objects (array, true)', () => {
    const currentProps = { a: [1, 2], b: 2, c: 3 };
    const nextProps = { a: [1, 2], b: 2, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(true);
  });

  it('return are props equal in two objects (array, false)', () => {
    const currentProps = { a: [1, 2], b: 2, c: 3 };
    const nextProps = { a: [1, 3], b: 3, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(false);
  });
});

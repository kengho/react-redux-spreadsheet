/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
import { expect } from 'chai';
import { fromJS } from 'immutable';

import * as Core from '../core';

describe('core', () => {
  it('get rowId and columnId by cellId', () => {
    expect(Core.rowId('r1,c1')).to.equal('r1');
    expect(Core.columnId('r1,c1')).to.equal('c1');
  });

  it('get cellId by rowId and columnId', () => {
    expect(Core.cellId('r1', 'c1')).to.equal('r1,c1');
  });

  it('get rowNumber and columnNumber', () => {
    expect(Core.rowNumber([0, 1])).to.equal(0);
    expect(Core.columnNumber([0, 1])).to.equal(1);
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
      session:{
        pointer: {
          cellId: null,
          modifiers: {},
        },
        hover: null,
        selection: [],
      }
    };

    expect(Core.initialTable(3, 4)).to.deep.equal(expectedInitialTable);
  });

  it('return initial state', () => {
    const expectedInitialState = fromJS({
      table: Core.initialTable(3, 4),
    });

    expect(Core.initialState(3, 4)).to.deep.equal(expectedInitialState);
  });

  it('get line ref', () => {
    expect(Core.lineRef([-1, 2])).to.equal('COLUMN');
    expect(Core.lineRef([2, -1])).to.equal('ROW');
  });

  it('get maximum pos in table', () => {
    const rows = ['r0', 'r1', 'r2'];
    const columns = ['c0', 'c1', 'c2',  'c3'];

    expect(Core.maxPos(rows, columns)).to.deep.equal([2, 3]);
  });

  it('get position after key pressed', () => {
    const rows = ['r0', 'r1', 'r2'];
    const columns = ['c0', 'c1', 'c2',  'c3'];

    expect(Core.calcNewPos(rows, columns, [],     'ArrowUp')).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [1, 2], 'ArrowUp')).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [0, 2], 'ArrowUp')).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(rows, columns, [],     'PageUp')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'PageUp')).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [0, 2], 'PageUp')).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(rows, columns, [],     'ArrowDown')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [0, 2], 'ArrowDown')).to.deep.equal([1, 2]); // OK

    expect(Core.calcNewPos(rows, columns, [],     'PageDown')).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [0, 2], 'PageDown')).to.deep.equal([2, 2]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 2], 'PageDown')).to.deep.equal([2, 2]); // border

    expect(Core.calcNewPos(rows, columns, [],     'ArrowLeft')).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'ArrowLeft')).to.deep.equal([2, 1]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 0], 'ArrowLeft')).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(rows, columns, [],     'Home')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'Home')).to.deep.equal([2, 0]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 0], 'Home')).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(rows, columns, [],     'ArrowRight')).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 2], 'ArrowRight')).to.deep.equal([2, 3]); // OK

    expect(Core.calcNewPos(rows, columns, [],     'End')).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos(rows, columns, [2, 1], 'End')).to.deep.equal([2, 3]); // OK
    expect(Core.calcNewPos(rows, columns, [2, 3], 'End')).to.deep.equal([2, 3]); // border
  });
});

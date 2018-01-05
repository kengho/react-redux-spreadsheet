/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */

require('./setupTests');

import { expect } from 'chai';
import { fromJS } from 'immutable';

import * as Core from './core';
import * as convertFormats from './convertFormats';

describe('core', () => {
  // TODO: rename its ('it should return/be able to/...').
  it('get rowId and columnId by cellId', () => {
    expect(Core.getRowId('r1,c1')).to.equal('r1');
    expect(Core.getRowId()).to.equal(undefined);
    expect(Core.getColumnId('r1,c1')).to.equal('c1');
    expect(Core.getColumnId()).to.equal(undefined);
  });

  it('get cellId by rowId and columnId', () => {
    expect(Core.getCellId('r1', 'c1')).to.equal('r1,c1');
    expect(Core.getCellId()).to.equal(undefined);
  });

  it('get rowNumber and columnNumber', () => {
    expect(Core.getRowNumber([0, 1])).to.equal(0);
    expect(Core.getColumnNumber([0, 1])).to.equal(1);
  });

  it('return initial lines (rows and columns)', () => {
    const expectedInitialLines = {
      rows: [{ id: 'r0' }, { id: 'r1' }, { id: 'r2' }],
      columns: [{ id: 'c0' }, { id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
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

  it('get maximum pos in table', () => {
    const rows = fromJS([{ id: 'r0' }, { id: 'r1' }, { id: 'r2' }]);
    const columns = fromJS([{ id: 'c0' }, { id: 'c1' }, { id: 'c2' }, { id: 'c3' }]);

    expect(Core.getMaxPos(rows, columns)).to.deep.equal([2, 3]);
  });

  it('get position after key pressed', () => {
    const rows = fromJS([{ id: 'r0' }, { id: 'r1' }, { id: 'r2' }]);
    const columns = fromJS([{ id: 'c0' }, { id: 'c1' }, { id: 'c2' }, { id: 'c3' }]);

    expect(Core.calcNewPos(null,   'ArrowUp', rows, columns)).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos([1, 2], 'ArrowUp', rows, columns)).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos([0, 2], 'ArrowUp', rows, columns)).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(null,   'PageUp', rows, columns)).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos([2, 2], 'PageUp', rows, columns)).to.deep.equal([0, 2]); // OK
    expect(Core.calcNewPos([0, 2], 'PageUp', rows, columns)).to.deep.equal([0, 2]); // border

    expect(Core.calcNewPos(null,   'ArrowDown', rows, columns)).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos([0, 2], 'ArrowDown', rows, columns)).to.deep.equal([1, 2]); // OK

    expect(Core.calcNewPos(null,   'PageDown', rows, columns)).to.deep.equal([2, 0]); // no pos
    expect(Core.calcNewPos([0, 2], 'PageDown', rows, columns)).to.deep.equal([2, 2]); // OK
    expect(Core.calcNewPos([2, 2], 'PageDown', rows, columns)).to.deep.equal([2, 2]); // border

    expect(Core.calcNewPos(null,   'ArrowLeft', rows, columns)).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos([2, 2], 'ArrowLeft', rows, columns)).to.deep.equal([2, 1]); // OK
    expect(Core.calcNewPos([2, 0], 'ArrowLeft', rows, columns)).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(null,   'Home', rows, columns)).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos([2, 2], 'Home', rows, columns)).to.deep.equal([2, 0]); // OK
    expect(Core.calcNewPos([2, 0], 'Home', rows, columns)).to.deep.equal([2, 0]); // border

    expect(Core.calcNewPos(null,   'ArrowRight', rows, columns)).to.deep.equal([0, 0]); // no pos
    expect(Core.calcNewPos([2, 2], 'ArrowRight', rows, columns)).to.deep.equal([2, 3]); // OK

    expect(Core.calcNewPos(null,   'End', rows, columns)).to.deep.equal([0, 3]); // no pos
    expect(Core.calcNewPos([2, 1], 'End', rows, columns)).to.deep.equal([2, 3]); // OK
    expect(Core.calcNewPos([2, 3], 'End', rows, columns)).to.deep.equal([2, 3]); // border
  });

  it('return are props equal in two objects (string, true)', () => {
    const currentProps = { a: 1, b: 2, c: 3 };
    const nextProps = { a: 1, b: 2, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(true);
  });

  it('return are props equal in two objects (string, false)', () => {
    const currentProps = { a: 1, b: 2, c: 3 };
    const nextProps = { a: 1, b: 3, c: 4 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(false);
  });

  it('return are props equal in two objects (immutable, true)', () => {
    const immutableObject = fromJS({ a: { a: 1 } });
    const currentProps = { a: immutableObject, b: 2, c: 3 };
    const nextProps = { a: immutableObject, b: 2, c: 3 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(true);
  });

  it('return are props equal in two objects (immutable, false)', () => {
    const immutableObject = fromJS({ a: { a: 1 } });
    const changedImmutableObject = immutableObject.set('a', 1);
    const currentProps = { a: immutableObject, b: 2, c: 3 };
    const nextProps = { a: changedImmutableObject, b: 2, c: 3 };
    const props = ['a', 'b'];

    expect(Core.arePropsEqual(currentProps, nextProps, props)).to.equal(false);
  });

  // TODO: return not pos, but rowNumber and columnNumber.
  // TODO: test parsing errors.
  describe('should crop, export and import', () => {
    const emptyData = fromJS(Core.initialTable(6, 5).data);

    it('cropping should not fail on empty data', () => {
      expect(Core.getCroppedSize(emptyData)).to.deep.equal([0, 0]);
    });

    it('cropping should not fail on empty data with remaining cell', () => {
      const emptyDataWithRemains = emptyData.set(
        'cells',
        fromJS({ 'r999,c999': { value: '999' } })
      );

      expect(Core.getCroppedSize(emptyDataWithRemains)).to.deep.equal([0, 0]);
    });

    // -- 01 02 -- --
    // 10 11 -- -- --
    // -- -- 22 -- --
    // -- -- -- -- --
    // 40 -- -- -- --
    // -- -- -- -- --
    const data = emptyData.set(
      'cells',
      fromJS({
        'r0,c1': { value: '01' },
        'r0,c2': { value: '02' },
        'r1,c0': { value: '10' },
        'r1,c1': { value: '11' },
        'r2,c2': { value: '22' },
        'r4,c0': { value: '40' },
      })
    );

    const historyData = data.setIn(
      ['cells', 'r0,c0', 'history'],
      fromJS([
        {
          time: Date.UTC(2017, 11, 19, 1, 1, 1),
          value: '00-history-1',
        },
      ])
    ).setIn(
      ['cells', 'r0,c1', 'history'],
      fromJS([
        {
          time: Date.UTC(2017, 11, 19, 1, 2, 1),
          value: '01-history-1',
        },
        {
          time: Date.UTC(2017, 11, 19, 1, 2, 2),
          value: '01-history-2',
        },
      ])
    ).setIn(
      ['cells', 'r1,c0', 'history'],
      fromJS([
        {
          time: Date.UTC(2017, 11, 19, 1, 3, 1),
          value: '10-history-1',
        },
        {
          time: Date.UTC(2017, 11, 19, 1, 3, 2),
          value: '10-history-2',
        },
      ])
    );

    const settings = fromJS({
      autoSaveHistory: false,
      tableHasHeader: true,
    });

    it('should return size of cropped table data', () => {
      expect(Core.getCroppedSize(data)).to.deep.equal([5, 3]);
    });

    it('should return CSV out of table data', () => {
      const expectedCSV = ',01,02\r\n10,11,\r\n,,22\r\n,,\r\n40,,';

      expect(Core.convert(data, undefined, convertFormats.CSV)).to.equal(expectedCSV);
    });

    it('should convert CSV to data object', () => {
      const CSV = Core.convert(data, undefined, convertFormats.CSV);

      const emptyCroppedData = fromJS(Core.initialTable(5, 3).data);
      const croppedData = emptyCroppedData.set(
        'cells',
        data.get('cells')
      );

      expect(fromJS(Core.convert(CSV, convertFormats.CSV).data)).to.deep.equal(croppedData);
    });

    it('should return JSON out of table data', () => {
      const expectedJSON = JSON.stringify({
        version: '1',
        data: [
          [
            {
              history: [
                {
                  time: '2017-12-19T01:01:01.000Z',
                  value: '00-history-1',
                },
              ],
            },
            {
              value: '01',
              history: [
                {
                  time: '2017-12-19T01:02:01.000Z',
                  value: '01-history-1',
                },
                {
                  time: '2017-12-19T01:02:02.000Z',
                  value: '01-history-2',
                },
              ],
            },
            {
              value: '02',
            },
          ],
          [
            {
              value: '10',
              history: [
                {
                  time: '2017-12-19T01:03:01.000Z',
                  value: '10-history-1',
                },
                {
                  time: '2017-12-19T01:03:02.000Z',
                  value: '10-history-2',
                },
              ],
            },
            {
              value: '11',
            },
            {},
          ],
          [{}, {}, { value: '22' }],
          [{}, {}, {}],
          [{ value: '40' }, {}, {}],
        ],
      });

      expect(
        Core.convert({ data: historyData }, undefined, convertFormats.JSON
      )).to.deep.equal(expectedJSON);
    });

    it('should convert JSON to data object', () => {
      const object = Core.convert({ data: historyData }, undefined, convertFormats.JSON);

      const emptyCroppedData = fromJS(Core.initialTable(5, 3).data);
      const croppedHistoryData = emptyCroppedData.set(
        'cells',
        historyData.get('cells')
      );

      expect(fromJS(Core.convert(object, convertFormats.JSON).data)).to.deep.equal(croppedHistoryData);
    });

    it('should return JSON out of table data with settings', () => {
      const expectedJSON = JSON.stringify({
        version: '1',
        data: [
          [{}, { value: '01' }, { value: '02' }],
          [{ value: '10' }, { value: '11' }, {}],
          [{}, {}, { value: '22' }],
          [{}, {}, {}],
          [{ value: '40' }, {}, {}],
        ],
        settings: {
          autoSaveHistory: false,
          tableHasHeader: true,
        },
      });

      expect(Core.convert({ data, settings }, undefined, convertFormats.JSON)).to.deep.equal(expectedJSON);
    });

    it('should convert JSON with settings to data object', () => {
      const object = Core.convert({ data, settings }, undefined, convertFormats.JSON);

      const emptyCroppedData = fromJS(Core.initialTable(5, 3).data);
      const croppedData = emptyCroppedData.set(
        'cells',
        data.get('cells')
      );

      expect(fromJS(Core.convert(object, convertFormats.JSON).data)).to.deep.equal(croppedData);
    });
  });
});

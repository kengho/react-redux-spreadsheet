import { expect } from 'chai';

import { getRowsList, getColumnsList } from './utils';
import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ];

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '10', size: null, cells: [{}, {}, {}, {}] },
        { id: '11', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ];

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{}, {}, {}, {}] },
        { id: '10', size: null, cells: [{}, {}, {}, {}] },
        { id: '11', size: null, cells: [{}, {}, {}, {}] },
        { id: '01', size: null, cells: [{}, {}, {}, {}] },
        { id: '02', size: null, cells: [{}, {}, {}, {}] },
        { id: '50', size: null, cells: [{}, {}, {}, {}] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ];

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{ v: '00' }, { v: '01' }, {}, {}, {}, { v: '02' }, { v: '03' }] },
        { id: '10', size: null, cells: [{ v: '10' }, { v: '11' }, {}, {}, {}, { v: '12' }, { v: '13' }] },
        { id: '11', size: null, cells: [{ v: '20' }, { v: '21' }, {}, {}, {}, { v: '22' }, { v: '23' }] },
        { id: '01', size: null, cells: [{ v: '30' }, { v: '31' }, {}, {}, {}, { v: '32' }, { v: '33' }] },
        { id: '02', size: null, cells: [{ v: '40' }, { v: '41' }, {}, {}, {}, { v: '42' }, { v: '43' }] },
        { id: '50', size: null, cells: [{ v: '50' }, { v: '51' }, {}, {}, {}, { v: '52' }, { v: '53' }] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '20', size: null },
        { id: '21', size: null },
        { id: '22', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
      ];

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{ v: '00' }, { v: '01' }, {}, {}, {}, { v: '02' }, { v: '03' }, {}, {}] },
        { id: '10', size: null, cells: [{ v: '10' }, { v: '11' }, {}, {}, {}, { v: '12' }, { v: '13' }, {}, {}] },
        { id: '11', size: null, cells: [{ v: '20' }, { v: '21' }, {}, {}, {}, { v: '22' }, { v: '23' }, {}, {}] },
        { id: '01', size: null, cells: [{ v: '30' }, { v: '31' }, {}, {}, {}, { v: '32' }, { v: '33' }, {}, {}] },
        { id: '02', size: null, cells: [{ v: '40' }, { v: '41' }, {}, {}, {}, { v: '42' }, { v: '43' }, {}, {}] },
        { id: '50', size: null, cells: [{ v: '50' }, { v: '51' }, {}, {}, {}, { v: '52' }, { v: '53' }, {}, {}] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '20', size: null },
        { id: '21', size: null },
        { id: '22', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
        { id: '70', size: null },
        { id: '71', size: null },
      ];

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });
});

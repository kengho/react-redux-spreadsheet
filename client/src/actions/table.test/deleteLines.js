import { expect } from 'chai';

import { getRowsList, getColumnsList } from './utils';
import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{}, {}, {}, {}, {}] },
        { id: '03', size: null, cells: [{}, {}, {}, {}, {}] },
      ];
      // expectedColumnsList = fromJS([
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '01', size: null },
        { id: '02', size: null },
        { id: '03', size: null },
        { id: '04', size: null },
      ];

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
      expectedRowsList = [
        { id: '00', size: null, cells: [{ v: '00' }, { v: '04' }] },
        { id: '03', size: null, cells: [{ v: '10' }, { v: '14' }] },
      ];
      expectedColumnsList = [
        { id: '00', size: null },
        { id: '04', size: null },
      ];

      expect(getRowsList(store)).to.deep.equal(expectedRowsList);
      expect(getColumnsList(store)).to.deep.equal(expectedColumnsList);
    });
  });
});

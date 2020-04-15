import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../../actions/table';
import configureStore from '../configureStore';

// TODO: test for batched actions.
describe('pushCellHistoryOnValueChanges', () => {
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
  const getCellHistory = (store) => {
    const rowIndex = cell[ROW].index;
    const columnIndex = cell[COLUMN].index;
    return store.getState().table.present.major.layout[ROW].list[rowIndex].cells[columnIndex].history;
  };

  it('should create and push cell history on setProp', () => {
    store.dispatch(TableActions.setProp({ ...cell, prop: 'value', value: 'a' }));
    store.dispatch(TableActions.setProp({ ...cell, prop: 'value', value: 'b' }));
    store.dispatch(TableActions.setProp({ ...cell, prop: 'value', value: 'c' }));

    const expectedCellHistory = [
      {
        time: new Date('1970-01-01'),
        value: '',
      },
      {
        time: new Date('1970-01-01'),
        value: 'a',
      },
      {
        time: new Date('1970-01-01'),
        value: 'b',
      },
    ];
    const actualCellHistory = getCellHistory(store);

    expect(actualCellHistory).to.deep.equal(expectedCellHistory);
  });
});

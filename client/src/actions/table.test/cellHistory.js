import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('cell history', () => {
  const state = Core.initialState();
  const store = configureStore(state);
  let expectedCellHistory;
  let actualCellHistory;

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

  it('should create and push cell history', () => {
    store.dispatch(TableActions.pushCellHistory(cell, new Date('1970-01-01'), ''));
    store.dispatch(TableActions.pushCellHistory(cell, new Date('1970-01-01'), 'a'));
    store.dispatch(TableActions.pushCellHistory(cell, new Date('1970-01-01'), 'b'));

    expectedCellHistory = [
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
    actualCellHistory = getCellHistory(store);

    expect(actualCellHistory).to.deep.equal(expectedCellHistory);
  });

  it('should delete cell history', () => {
    store.dispatch(TableActions.deleteCellHistory(cell, 0));
    store.dispatch(TableActions.deleteCellHistory(cell, 1)); // former [2]

    actualCellHistory = getCellHistory(store);
    expectedCellHistory = [{
      time: new Date('1970-01-01'),
      value: 'a',
    }];

    expect(actualCellHistory).to.deep.equal(expectedCellHistory);
  });

  it('should delete cell all history if index is not specified', () => {
    store.dispatch(TableActions.deleteCellHistory(cell));

    actualCellHistory = getCellHistory(store);
    expectedCellHistory = [];

    expect(actualCellHistory).to.deep.equal(expectedCellHistory);
  });
});

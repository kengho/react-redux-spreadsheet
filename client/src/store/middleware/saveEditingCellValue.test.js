import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../../actions/table';
import configureStore from '../configureStore';

// TODO: test for batched actions.
describe('saveEditingCellValue', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  store.dispatch(TableActions.insertRows({ index: 3 }));
  store.dispatch(TableActions.insertColumns({ index: 4 }));

  const getCellValue = (cell) => store.getState()
    .table
    .present
    .major
    .layout[ROW]
    .list[cell[ROW].index]
    .cells[cell[COLUMN].index]
    .value;

  it('should save editing cell\'s value on moving pointer', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setPointerPosition({
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
    }));
    store.dispatch(TableActions.setPointerProps({
      edit: true,
      value: 'a',
    }));
    store.dispatch(TableActions.setPointerProps({
      edit: false,
    }));

    const expectedCellValue = 'a';
    const actualCellValue = getCellValue({
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      }
    });

    expect(actualCellValue).to.deep.equal(expectedCellValue);
  });
});

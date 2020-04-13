import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

// Mostly copied from setProp.js
it('should batch actions', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  process.logBelow = false;

  // expected table
  //    0   1   2
  // 0 ... ... ...
  // 1 ... ... 12
  const actionsToBatch = [];
  actionsToBatch.push(TableActions.insertRows({ index: 1 }));
  actionsToBatch.push(TableActions.insertColumns({ index: 2 }));
  actionsToBatch.push(TableActions.setProp({
    [ROW]: {
      index: 1,
    },
    [COLUMN]: {
      index: 2,
    },
    prop: 'value',
    value: '12',
  }));
  store.dispatch(TableActions.batchActions(actionsToBatch));

  const cellValue = store.getState().table.present.major.layout[ROW].list[1].cells[2].value;

  expect(cellValue).to.equal('12');
});

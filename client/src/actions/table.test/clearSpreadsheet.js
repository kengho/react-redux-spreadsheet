import { expect } from 'chai';

import { setCellsValues } from './utils';
import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

it('should clear spreadsheet', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  const cells = [
    ['00' , '01', '02'],
    ['10' , '11', '12'],
  ];
  setCellsValues(store, cells);

  // Not considering history in this test.
  const {
    history,
    ...someActualCell
  } = store.getState().table.present.major.layout[ROW].list[0].cells[1];
  expect(someActualCell).to.deep.equal({ value: '01' });

  store.dispatch(TableActions.clearSpreadsheet());

  const expectedLayout = {
    [ROW]: {
      defaultSize: 150,
      marginSize: 100,
      list: [],
    },
    [COLUMN]: {
      defaultSize: 175,
      marginSize: 150,
      list: [],
    },
  };
  const actualLayout = store.getState().table.present.major.layout;

  expect(actualLayout).to.deep.equal(expectedLayout);
});

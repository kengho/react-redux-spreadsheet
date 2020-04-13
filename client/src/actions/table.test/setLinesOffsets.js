import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

it('should set line size', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  store.dispatch(TableActions.setLinesOffsets({
    [ROW]: [10, 20, 40],
    [COLUMN]: [15, 30, 45],
  }));

  const actualLinesOffsets = store.getState().table.present.minor.linesOffsets;
  const expectedLinesOffsets = {
    [ROW]: [10, 20, 40],
    [COLUMN]: [15, 30, 45],
  };

  expect(actualLinesOffsets).to.deep.equal(expectedLinesOffsets);
});

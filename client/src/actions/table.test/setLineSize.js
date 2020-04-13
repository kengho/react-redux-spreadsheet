import { expect } from 'chai';

import { ROW } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

it('should set line size', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  store.dispatch(TableActions.insertRows({ index: 2 }));
  store.dispatch(TableActions.setLineSize({
    lineType: ROW,
    index: 2,
    size: 313,
  }));

  const actualLineSize = store.getState().table.present.major.layout[ROW].list[2].size;
  const expectedLineSize = 313;

  expect(actualLineSize).to.equal(expectedLineSize);
});

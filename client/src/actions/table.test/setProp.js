import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('set prop', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  // NOTE: we don't need this because expandTableLayout() should always
  //   come before setProp() and cell path should always exist.
  // it('shouldn\'t set prop if described cell don\'t exists', () => {
  //   process.logBelow = false;
  //   const tableBeforeDispatch = store.getState().table.present;
  //   store.dispatch(TableActions.setProp(args));
  //   const tableAfterDispatch = store.getState().table.present;
  //
  //   expect(tableAfterDispatch).to.deep.equal(tableBeforeDispatch);
  // });

  it('should set prop if described cell exists', () => {
    process.logBelow = false;

    // expected table
    //    0   1   2
    // 0 ... ... ...
    // 1 ... ... 12
    store.dispatch(TableActions.insertRows({ index: 1 }));
    store.dispatch(TableActions.insertColumns({ index: 2 }));
    store.dispatch(TableActions.setProp({
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      prop: 'value',
      value: '12',
    }));

    const cellValue = store.getState().table.present.major.layout[ROW].list[1].cells[2].value;

    expect(cellValue).to.equal('12');
  });

  it('should delete prop if undefined passed', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setProp({
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      prop: 'value',
      value: undefined,
    }));

    // Not considering history in this test.
    const { history, ...cell } = store.getState().table.present.major.layout[ROW].list[1].cells[2];

    expect(cell).to.deep.equal({});
  });
});

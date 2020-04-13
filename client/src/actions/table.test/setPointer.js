import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import { setCellsValues, getPointer } from './utils';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('set pointer', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  let pointer;
  let expectedPointer;

  const cells = [
    ['00' , '01', '02'],
    ['10' , '11', '12'],
  ];
  setCellsValues(store, cells);

  it('should set pointer if all args are present', () => {
    process.logBelow = true;

    pointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: 'asd',
      edit: true,
      selectOnFocus: true,
    };
    store.dispatch(TableActions.setPointer(pointer));

    expectedPointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: 'asd',
      edit: true,
      selectOnFocus: true,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should set pointer and value from table if value not passed', () => {
    process.logBelow = true;

    pointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      edit: true,
      selectOnFocus: true,
    };
    store.dispatch(TableActions.setPointer(pointer));

    expectedPointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: '12',
      edit: true,
      selectOnFocus: true,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should set only value if only value is passed', () => {
    process.logBelow = false;

    pointer = { value: '12-2' };
    store.dispatch(TableActions.setPointer(pointer));

    expectedPointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: '12-2',
      edit: true,
      selectOnFocus: true,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should set some flags and nothing else if only some flags passed', () => {
    process.logBelow = false;

    pointer = {
      edit: false,
      selectOnFocus: false,
    };
    store.dispatch(TableActions.setPointer(pointer));

    expectedPointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: '12-2',
      edit: false,
      selectOnFocus: false,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });
});

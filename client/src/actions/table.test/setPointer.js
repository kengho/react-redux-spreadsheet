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

  it('should set pointer props', () => {
    process.logBelow = true;

    store.dispatch(TableActions.setPointerProps({
      value: '1',
      edit: true,
      selectOnFocus: false,
    }));
    expectedPointer = {
      [ROW]: {
        index: 0,
      },
      [COLUMN]: {
        index: 0,
      },
      value: '1',
      edit: true,
      selectOnFocus: false,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should set pointer position and corresponding value (if cell exists)', () => {
    process.logBelow = true;

    store.dispatch(TableActions.setPointerPosition({
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
    }));
    expectedPointer = {
      [ROW]: {
        index: 1,
      },
      [COLUMN]: {
        index: 2,
      },
      value: '12',
      edit: true,
      selectOnFocus: false,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });

  it('should set pointer position and empty value (if cell doesn\'t exists)', () => {
    process.logBelow = true;

    store.dispatch(TableActions.setPointerPosition({
      [ROW]: {
        index: 3,
      },
      [COLUMN]: {
        index: 4,
      },
    }));
    expectedPointer = {
      [ROW]: {
        index: 3,
      },
      [COLUMN]: {
        index: 4,
      },
      value: '',
      edit: true,
      selectOnFocus: false,
    };

    expect(getPointer(store)).to.deep.equal(expectedPointer);
  });
});

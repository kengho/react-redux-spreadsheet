import { expect } from 'chai';

import {
  ROW,
  COLUMN,
  BEGIN,
  END,
} from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('clipboard', () => {
  const state = Core.initialState();
  const store = configureStore(state);
  const getClipboard = (store) => store.getState().table.present.major.session.clipboard;

  it('should set clipboard', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setClipboard({
      boundary: {
        [ROW]: {
          [BEGIN]: {
            index: 1,
          },
          [END]: {
            index: 2,
          },
        },
        [COLUMN]: {
          [BEGIN]: {
            index: 3,
          },
          [END]: {
            index: 4,
          },
        },
      },
      rows: [{
        id: 1,
        size: 2,
        cells: [{ value: '3' }],
      }],
    }));

    const expectedClipboard = [{
      boundary: {
        [ROW]: {
          [BEGIN]: {
            index: 1,
          },
          [END]: {
            index: 2,
          },
        },
        [COLUMN]: {
          [BEGIN]: {
            index: 3,
          },
          [END]: {
            index: 4,
          },
        },
      },
      rows: [{
        id: 1,
        size: 2,
        cells: [{ value: '3' }],
      }],
    }];

    expect(getClipboard(store)).to.deep.equal(expectedClipboard);
  });

  it('should clear clipboard', () => {
    process.logBelow = false;

    store.dispatch(TableActions.clearClipboard());
    const expectedClipboard = [{
      boundary: {
        [ROW]: null,
        [COLUMN]: null,
      },
      rows: null,
    }];

    expect(getClipboard(store)).to.deep.equal(expectedClipboard);
  });
});

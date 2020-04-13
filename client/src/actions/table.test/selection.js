import { expect } from 'chai';

import { getSelection } from './utils';
import {
  BEGIN,
  COLUMN,
  END,
  ROW,
} from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('selection', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);
  let expectedCurrentSelection;
  let expectedSelection;
  const getCurrentSelection = (store) => store.getState().table.present.minor.currentSelection;

  it('should set current selection anchor', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setCurrentSelectionAnchor({
      selectionAnchorType: BEGIN,
      anchor: {
        [ROW]: {
          index: 2,
        },
        [COLUMN]: {
          index: 1,
        },
      },
    }));
    store.dispatch(TableActions.setCurrentSelectionAnchor({
      selectionAnchorType: END,
      anchor: {
        [ROW]: {
          index: 3,
        },
        [COLUMN]: {
          index: 4,
        },
      },
    }));

    expectedCurrentSelection = {
      visibility: false,
      [BEGIN]: {
        [ROW]: {
          index: 2,
        },
        [COLUMN]: {
          index: 1,
        },
      },
      [END]: {
        [ROW]: {
          index: 3,
        },
        [COLUMN]: {
          index: 4,
        },
      },
    };

    expect(getCurrentSelection(store)).to.deep.equal(expectedCurrentSelection);
  });

  it('should set current selection visibility', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setCurrentSelectionVisibility(true));

    expectedCurrentSelection = {
      visibility: true,
      [BEGIN]: {
        [ROW]: {
          index: 2,
        },
        [COLUMN]: {
          index: 1,
        },
      },
      [END]: {
        [ROW]: {
          index: 3,
        },
        [COLUMN]: {
          index: 4,
        },
      },
    };

    expect(getCurrentSelection(store)).to.deep.equal(expectedCurrentSelection);
  });

  it('shouldn fixate current selection', () => {
    process.logBelow = false;

    store.dispatch(TableActions.fixateCurrentSelection());

    expectedSelection = [{
      boundary: {
        [ROW]: {
          [BEGIN]: {
            index: 2,
          },
          [END]: {
            index: 3,
          },
        },
        [COLUMN]: {
          [BEGIN]: {
            index: 1,
          },
          [END]: {
            index: 4,
          },
        },
      },
    }];

    expect(getSelection(store)).to.deep.equal(expectedSelection);
  });

  it('should clear selection', () => {
    process.logBelow = false;

    store.dispatch(TableActions.clearSelection());

    expectedSelection = [{
      boundary: {
        [ROW]: null,
        [COLUMN]: null,
      },
    }];

    expect(getSelection(store)).to.deep.equal(expectedSelection);
  });

  it('shouldn\' t fixate one-celled current selection (we have regular pointer for that)', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setCurrentSelectionAnchor({
      selectionAnchorType: BEGIN,
      anchor: {
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 1,
        },
      },
    }));
    store.dispatch(TableActions.setCurrentSelectionAnchor({
      selectionAnchorType: END,
      anchor: {
        [ROW]: {
          index: 1,
        },
        [COLUMN]: {
          index: 1,
        },
      },
    }));
    store.dispatch(TableActions.fixateCurrentSelection());

    expectedSelection = [{
      boundary: {
        [ROW]: null,
        [COLUMN]: null,
      },
    }];

    expect(getSelection(store)).to.deep.equal(expectedSelection);
  });
});

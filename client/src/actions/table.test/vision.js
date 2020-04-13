import { expect } from 'chai';

import { ROW, COLUMN } from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('vision', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);
  let actualVision;
  let expectedVision;

  it('should update scroll size', () => {
    store.dispatch(TableActions.setScrollSize(100, 200));

    actualVision = store.getState().table.present.major.vision;
    expectedVision = {
      [ROW]: {
        scrollSize: 100,
        screenSize: 1000,
      },
      [COLUMN]: {
        scrollSize: 200,
        screenSize: 800,
      },
    };

    expect(actualVision).to.deep.equal(expectedVision);
  });

  it('should update screen size', () => {
    store.dispatch(TableActions.setScreenSize(400, 300));

    actualVision = store.getState().table.present.major.vision;
    expectedVision = {
      [ROW]: {
        scrollSize: 100,
        screenSize: 400,
      },
      [COLUMN]: {
        scrollSize: 200,
        screenSize: 300,
      },
    };

    expect(actualVision).to.deep.equal(expectedVision);
  });
});

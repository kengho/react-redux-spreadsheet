import { expect } from 'chai';

import { setCellsValues, getCellsValues } from './utils';
import {
  ROW,
  COLUMN,
  ASCENDING,
  DESCENDING,
} from '../../constants';
import * as Core from '../../core';
import * as TableActions from '../table';
import configureStore from '../../store/configureStore';

describe('sort', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  const cells = [
    ['10', '2'  , 'header'],
    ['00', 'ab' , ''      ],
    ['20', 'aa' , ''      ],
    ['30', ''   , ''      ],
    ['40', '1'  , ''      ],
    ['50', 'aaa', ''      ],
  ];
  setCellsValues(store, cells);
  let expectedCells;

  it('should sort correctly in presense of header', () => {
    process.logBelow = false;

    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: ASCENDING,
      fixFirstLine: true,
    }));

    expectedCells = [
      ['10', '2'  , 'header'],
      ['30', ''   , ''      ],
      ['40', '1'  , ''      ],
      ['20', 'aa' , ''      ],
      ['50', 'aaa', ''      ],
      ['00', 'ab' , ''      ],
    ];

    expect(getCellsValues(store)).to.deep.equal(expectedCells);
  });

  it('should sort rows ascending', () => {
    process.logBelow = false;

    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: ASCENDING,
    }));

    expectedCells = [
      ['30', ''   , ''      ],
      ['40', '1'  , ''      ],
      ['10', '2'  , 'header'],
      ['20', 'aa' , ''      ],
      ['50', 'aaa', ''      ],
      ['00', 'ab' , ''      ],
    ];

    expect(getCellsValues(store)).to.deep.equal(expectedCells);
  });

  it('should sort rows descending', () => {
    process.logBelow = false;

    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: DESCENDING,
    }));

    expectedCells = [
      ['00', 'ab' , ''      ],
      ['50', 'aaa', ''      ],
      ['20', 'aa' , ''      ],
      ['10', '2'  , 'header'],
      ['40', '1'  , ''      ],
      ['30', ''   , ''      ],
    ];

    expect(getCellsValues(store)).to.deep.equal(expectedCells);
  });

  it('should handle cells without \'value\' prop correctly', () => {
    process.logBelow = false;

    store.dispatch(TableActions.setProp({
      [ROW]: {
        index: 5,
      },
      [COLUMN]: {
        index: 1,
      },
      prop: 'value',
      value: undefined,
    }));
    store.dispatch(TableActions.sort({
      lineType: COLUMN,
      index: 1,
      order: ASCENDING,
    }));

    expectedCells = [
      ['40', '1'  , ''      ],
      ['10', '2'  , 'header'],
      ['20', 'aa' , ''      ],
      ['50', 'aaa', ''      ],
      ['00', 'ab' , ''      ],
      ['30', null , ''      ],
    ];

    expect(getCellsValues(store)).to.deep.equal(expectedCells);
  });
});

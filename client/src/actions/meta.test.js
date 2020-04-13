import { expect } from 'chai';

import { getRowsList } from './table.test/utils';
import { ROW, COLUMN } from './../constants';
import * as Core from './../core';
import * as TableActions from './table';
import * as MetaActions from './meta';
import configureStore from './../store/configureStore';

describe('meta', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  it('should update state using updater', () => {
    store.dispatch(TableActions.insertRows({ index: 2 }));
    store.dispatch(TableActions.insertColumns({ index: 3 }));

    expect(getRowsList(store)).not.to.deep.equal([]);

    const linesEraserUpdater = (state) => { state.major.layout[ROW].list = [] };
    store.dispatch(MetaActions.update('table', linesEraserUpdater));

    expect(getRowsList(store)).to.deep.equal([]);
  });

  it('should merge server-side state with app-side state', () => {
    store.dispatch(TableActions.movePointer({ key: 'ArrowDown' }));
    let actualSession = store.getState().table.present.major.session;
    const initialSession = Core.initialState().table.major.session;
    expect(actualSession).not.to.deep.equal(initialSession);

    const serverState = {
      table: {
        major: {
          layout: {
            [ROW]: {
              defaultSize: 55,
              marginSize: 44,
              list: [{ id: 'r0', cells: [{ value: '11' }]}],
            },
            [COLUMN]: {
              defaultSize: 66,
              marginSize: 77,
              list: [{ id: 'c0' }],
            },
          },
        },
      },
      settings: {
        autoSaveHistory: false,
        spreadsheetName: 'some name',
        tableHasHeader: true,
      },
    };
    store.dispatch(MetaActions.mergeServerState(serverState));

    const actualLayout = store.getState().table.present.major.layout;
    const expectedLayout = {
      [ROW]: {
        defaultSize: 55,
        marginSize: 44,
        list: [{ id: 'r0', cells: [{ value: '11' }]}],
      },
      [COLUMN]: {
        defaultSize: 66,
        marginSize: 77,
        list: [{ id: 'c0' }],
      },
    };
    expect(actualLayout).to.deep.equal(expectedLayout);

    actualSession = store.getState().table.present.major.session;
    expect(actualSession).to.deep.equal(initialSession);

    const actualSettings = store.getState().settings;
    const expectedSettings = {
      autoSaveHistory: false,
      spreadsheetName: 'some name',
      tableHasHeader: true,
    };
    expect(actualSettings).to.deep.equal(expectedSettings);
  });
});

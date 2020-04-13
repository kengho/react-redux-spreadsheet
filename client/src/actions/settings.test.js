import { expect } from 'chai';

import * as Core from './../core';
import * as SettingsActions from './settings';
import configureStore from './../store/configureStore';

describe('settings', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  it('should set settings', () => {
    store.dispatch(SettingsActions.setSettings({
      autoSaveHistory: false,
      spreadsheetName: 'some_spreadsheet_name',
      tableHasHeader: false,
    }));
    const actualSettings = store.getState().settings;
    const expectedSettings = {
      autoSaveHistory: false,
      spreadsheetName: 'some_spreadsheet_name',
      tableHasHeader: false,
    };

    expect(actualSettings).to.deep.equal(expectedSettings);
  });
});

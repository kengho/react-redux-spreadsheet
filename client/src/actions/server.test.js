import { expect } from 'chai';

import * as Core from './../core';
import * as ServerActions from './server';
import configureStore from './../store/configureStore';

describe('server', () => {
  const state = Core.initialState();
  const store = configureStore(state);

  it('should set short id', () => {
    store.dispatch(ServerActions.setShortId('1'));
    const actualShortId = store.getState().server.shortId;
    const expectedShortId = '1';

    expect(actualShortId).to.equal(expectedShortId);
  });

  it('should set sever sync flag', () => {
    store.dispatch(ServerActions.setSync(false));
    const actualSync = store.getState().server.sync;
    const expectedSync = false;

    expect(actualSync).to.equal(expectedSync);
  });

  // TODO: TEST: test somehow.
  // it('should make server request', () => {
  // });

  it('should set request failed flag', () => {
    store.dispatch(ServerActions.setRequestFailed(true));
    const actualRequestFailed = store.getState().server.requestFailed;
    const expectedRequestFailed = true;

    expect(actualRequestFailed).to.equal(expectedRequestFailed);
  });

  it('should set sync in progress flag', () => {
    store.dispatch(ServerActions.setSyncInProgress(true));
    const actualSyncInProgress = store.getState().server.syncInProgress;
    const expectedSyncInProgress = true;

    expect(actualSyncInProgress).to.equal(expectedSyncInProgress);
  });

  it('should set errors', () => {
    store.dispatch(ServerActions.setErrors(['error1', 'error2']));
    const actualErrors = store.getState().server.errors;
    const expectedErrors = ['error1', 'error2'];

    expect(actualErrors).to.deep.equal(expectedErrors);
  });
});

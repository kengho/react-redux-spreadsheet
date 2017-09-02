/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */

require('../test_helper');

import { expect } from 'chai';
import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

import {
  markRequestAsFailed,
  popRequestId,
  pushRequest,
} from './requests';
import { configureStore } from '../store/configureStore';

describe('requests', () => {
  it('should be able to push request', () => {
    const store = configureStore();
    const method = 'GET';
    const action = 'update';
    const params = { data: [1, 2, 3] };
    const id = uuid();

    store.dispatch(pushRequest(method, action, params, id));

    const nextStateExpected = fromJS({
      requests: {
        queue: [{
          method,
          action,
          params,
          id,
        }],
        counter: 1,
      },
    });
    expect(store.getState().get('requests')).to.deep.equal(nextStateExpected.get('requests'));
  });

  it('should be able to pop request by id', () => {
    const store = configureStore();
    const method = 'GET';
    const action = 'update';
    const params = { data: [1, 2, 3] };
    const id = uuid();

    store.dispatch(pushRequest(method, action, params, id));
    store.dispatch(popRequestId(id));

    const nextStateExpected = fromJS({ requests: { queue: [], counter: 1 } });
    expect(store.getState().get('requests')).to.deep.equal(nextStateExpected.get('requests'));
  });

  it('should be able to mark request as failed', () => {
    const store = configureStore();
    const method = 'GET';
    const action = 'update';
    const params = { data: [1, 2, 3] };
    const id = uuid();

    store.dispatch(pushRequest(method, action, params, id));
    store.dispatch(markRequestAsFailed(id));

    const nextStateExpected = fromJS({
      requests: {
        queue: [{
          method,
          action,
          params,
          id,
          failed: true,
        }],
        counter: 1,
      },
    });
    expect(store.getState().get('requests')).to.deep.equal(nextStateExpected.get('requests'));
  });
});

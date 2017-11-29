/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */

require('../setupTests');

import { expect } from 'chai';
import { fromJS } from 'immutable';
import uuid from 'uuid/v4';

import {
  requestsMarkAsFailed,
  requestsPop,
  requestsPush,
} from './requests';
import { configureStore } from '../store/configureStore';

describe('requests', () => {
  it('should be able to push request', () => {
    const store = configureStore();
    const method = 'GET';
    const action = 'update';
    const params = { data: [1, 2, 3] };
    const id = uuid();

    store.dispatch(requestsPush(method, action, params, id));

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

    store.dispatch(requestsPush(method, action, params, id));
    store.dispatch(requestsPop(id));

    const nextStateExpected = fromJS({ requests: { queue: [], counter: 1 } });
    expect(store.getState().get('requests')).to.deep.equal(nextStateExpected.get('requests'));
  });

  it('should be able to mark request as failed', () => {
    const store = configureStore();
    const method = 'GET';
    const action = 'update';
    const params = { data: [1, 2, 3] };
    const id = uuid();

    store.dispatch(requestsPush(method, action, params, id));
    store.dispatch(requestsMarkAsFailed(id));

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

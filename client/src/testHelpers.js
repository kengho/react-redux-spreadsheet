import { createMemoryHistory } from 'history';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import React from 'react';

import { configureStore } from './store/configureStore';
import { getCellId } from './core';
import getRootPath from './lib/getRootPath';

export const getDataWrapperTestKey = (someCellId) => `data-${someCellId}-wrapper`;

// https://github.com/Semantic-Org/Semantic-UI-React/issues/1319#issuecomment-279477029
const nativeEvent = { nativeEvent: { stopImmediatePropagation: () => {} } };

export const getStore = () => {
  const spreadsheetPath = `${getRootPath()}empty_spreadsheet_short_id`;
  const history = createMemoryHistory({ initialEntries: [spreadsheetPath] });
  const store = configureStore(undefined, history);

  return [store, history];
};

export const getRootWrapper = (SomeApp, someStore, someHistory) => {
  return mount(
    <Provider store={someStore}>
      <SomeApp history={someHistory} />
    </Provider>
  );
};

const getDataWrapper = (someRootWrapper, someCellId) => {
  return someRootWrapper.find({
    'test-key': getDataWrapperTestKey(someCellId),
  });
};

export const dispatchEventOnCellWrapper = (
  someRootWrapper,
  someCellId,
  someEventName
) => {
  const dataWrapper = getDataWrapper(someRootWrapper, someCellId);
  dataWrapper.simulate(someEventName, nativeEvent);
};

export const onlyOneDataWrapperHasClassTest = (
  someStore,
  someRootWrapper,
  someCellId,
  someClassName
) => {
  const data = someStore.getState().get('table').present.get('data');
  data.get('rows').forEach((row) => {
    data.get('columns').forEach((column) => {
      const currentCellId = getCellId(row.get('id'), column.get('id'));
      const currentDataWrapper = getDataWrapper(someRootWrapper, currentCellId);
      const currentDataWrapperHasClass = currentDataWrapper.hasClass(someClassName);
      if (currentCellId === someCellId) {
        expect(currentDataWrapperHasClass).to.equal(true);
      } else {
        expect(currentDataWrapperHasClass).to.equal(false);
      }
    });
  });
};

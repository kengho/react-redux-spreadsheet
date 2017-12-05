import { createMemoryHistory } from 'history';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import React from 'react';

import { configureStore } from './store/configureStore';
import { getCellId } from './core';
import { getDataWrapperTestKey } from './testKeysGetters';
import getRootPath from './lib/getRootPath';

// https://github.com/Semantic-Org/Semantic-UI-React/issues/1319#issuecomment-279477029
const nativeEvent = { nativeEvent: { stopImmediatePropagation: () => {} } };

export const getStore = () => {
  const spreadsheetPath = `${getRootPath()}test`;
  const history = createMemoryHistory({ initialEntries: [spreadsheetPath] });

  // NOTE: Default state is Core.initialState(3, 4)
  //   (see Spreadsheet's componentDidMount()).
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
  process.env['DISPATCH_DOCUMENT_EVENTS'] = 'false';
  const dataWrapper = getDataWrapper(someRootWrapper, someCellId);
  dataWrapper.simulate(someEventName, nativeEvent);
  process.env['DISPATCH_DOCUMENT_EVENTS'] = 'true';
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

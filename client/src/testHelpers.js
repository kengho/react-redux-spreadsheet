import { expect } from 'chai';

import { getCellId } from './core';

export const getDataWrapperTestKey = (someCellId) => `data-${someCellId}-wrapper`;

// https://github.com/Semantic-Org/Semantic-UI-React/issues/1319#issuecomment-279477029
const nativeEvent = { nativeEvent: { stopImmediatePropagation: () => {} } };

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

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
/* eslint-disable object-property-newline */
/* eslint-disable no-multi-spaces */
/* eslint-disable key-spacing */
import { expect } from 'chai';
import { fromJS } from 'immutable';

import * as Core from '../../core';
import * as TableActions from '../../actions/table';
import configureStore from '../../store/configureStore';

// process.log = (x) => console.log(JSON.stringify(x, null, 2));

const tableSize = [3, 4];

describe('table', () => {
  it('set table from JSON', () => {
    const tableJSON = `{
      "data": {
        "rows": ["r0", "r1", "r2"],
        "columns": ["c0", "c1", "c2", "c3"],
        "cells": {}
      },
      "session": {
        "pointer": {
          "cellId": null,
          "modifiers": {}
        },
        "hover": null,
        "selection": {
          "cellsIds": []
        },
        "clipboard": {
          "cells": {},
          "operation": null
        }
      },
      "updateTriggers": {
        "data": {
          "rows": {}
        }
      }
    }`;

    const store = configureStore();
    store.dispatch(TableActions.setTableFromJSON(tableJSON));

    const expectedTable = fromJS({
      data: {
        rows: ['r0', 'r1', 'r2'],
        columns: ['c0', 'c1', 'c2', 'c3'],
        cells: {},
      },
      session: {
        pointer: {
          cellId: null,
          modifiers: {},
        },
        hover: null,
        selection: {
          cellsIds: [],
        },
        clipboard: {
          cells: {},
          operation: null,
        }
      },
      updateTriggers: {
        data: {
          rows: {},
        },
      },
    });

    expect(store.getState().get('table')).to.deep.equal(expectedTable);
  });

  it('set table from JSON (no session given)', () => {
    const tableJSON = `{
      "data": {
        "rows": ["r0", "r1", "r2"],
        "columns": ["c0", "c1", "c2", "c3"],
        "cells": {}
      }
    }`;

    const store = configureStore();
    store.dispatch(TableActions.setTableFromJSON(tableJSON));

    const expectedTable = fromJS({
      data: {
        rows: ['r0', 'r1', 'r2'],
        columns: ['c0', 'c1', 'c2', 'c3'],
        cells: {},
      },
      session: {
        pointer: {
          cellId: null,
          modifiers: {},
        },
        hover: null,
        selection: {
          cellsIds: [],
        },
        clipboard: {
          cells: {},
          operation: null,
        },
      },
      updateTriggers: {
        data: {
          rows: {},
        },
      },
    });

    expect(store.getState().get('table')).to.deep.equal(expectedTable);
  });

  describe('cells', () => {
    it('set prop', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = 'r1,c1';
      const value = 'Cell value';

      store.dispatch(TableActions.setProp(cellId, 'value', value));
      const expectedCells = fromJS({ 'r1,c1': { value } });

      expect(store.getState().getIn(['table', 'data', 'cells'])).to.deep.equal(expectedCells);
    });

    it('set prop (undefined cellId)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = undefined;
      const value = 'Cell value';

      store.dispatch(TableActions.setProp(cellId, 'value', value));
      const expectedCells = fromJS({});

      expect(store.getState().getIn(['table', 'data', 'cells'])).to.deep.equal(expectedCells);
    });

    it('delete prop (more that one prop remaining)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = 'r1,c1';
      const value = 'Cell value';
      const color = 'red';

      store.dispatch(TableActions.setProp(cellId, 'value', value));
      store.dispatch(TableActions.setProp(cellId, 'color', color));
      store.dispatch(TableActions.deleteProp(cellId, 'color'));

      const expectedCells = fromJS({ 'r1,c1': { value } });

      expect(store.getState().getIn(['table', 'data', 'cells'])).to.deep.equal(expectedCells);
    });

    it('delete prop (no props remaining)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = 'r1,c1';
      const value = 'Cell value';

      store.dispatch(TableActions.setProp(cellId, 'value', value));
      store.dispatch(TableActions.deleteProp(cellId, 'value'));

      const expectedCells = fromJS({});

      expect(store.getState().getIn(['table', 'data', 'cells'])).to.deep.equal(expectedCells);
    });

    it('delete prop (there is no cell with such cellId)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = 'r1,c1';

      store.dispatch(TableActions.deleteProp(cellId, 'value'));

      const expectedCells = fromJS({});

      expect(store.getState().getIn(['table', 'data', 'cells'])).to.deep.equal(expectedCells);
    });
  });

  describe('hover', () => {
    it('set hover', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const cellId = 'r1,c1';

      store.dispatch(TableActions.setHover(cellId));

      const expectedHover = 'r1,c1';

      expect(store.getState().getIn(['table', 'session', 'hover'])).to.equal(expectedHover);
    });
  });

  describe('pointer', () => {
    it('set pointer', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const pointer = {
        cellId: 'r1,c1',
        modifiers: { edit: true },
      };

      store.dispatch(TableActions.setPointer(pointer));

      const expectedPointer = fromJS(pointer);

      expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
    });

    describe('movement', () => {
      it('move pointer (ArrowUp, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('ArrowUp'));

        const expectedPointer = fromJS({
          cellId: 'r2,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowUp, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r1,c2'));

        store.dispatch(TableActions.movePointer('ArrowUp'));

        const expectedPointer = fromJS({
          cellId: 'r0,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowUp, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r0,c2'));

        store.dispatch(TableActions.movePointer('ArrowUp'));

        const expectedPointer = fromJS({
          cellId: 'r0,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageUp, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('PageUp'));

        const expectedPointer = fromJS({
          cellId: 'r0,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageUp, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c2'));

        store.dispatch(TableActions.movePointer('PageUp'));

        const expectedPointer = fromJS({
          cellId: 'r0,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageUp, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r0,c2'));

        store.dispatch(TableActions.movePointer('PageUp'));

        const expectedPointer = fromJS({
          cellId: 'r0,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowDown, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('ArrowDown'));

        const expectedPointer = fromJS({
          cellId: 'r0,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowDown, expand)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c2'));

        store.dispatch(TableActions.movePointer('ArrowDown'));

        const expectedRows = fromJS(['r0',  'r1',  'r2',  'r3']);
        const expectedPointer = fromJS({
          cellId: 'r3,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'data', 'rows'])).to.equal(expectedRows);
        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageDown, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('PageDown'));

        const expectedPointer = fromJS({
          cellId: 'r2,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageDown, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r0,c2'));

        store.dispatch(TableActions.movePointer('PageDown'));

        const expectedPointer = fromJS({
          cellId: 'r2,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (PageDown, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c2'));

        store.dispatch(TableActions.movePointer('PageDown'));

        const expectedPointer = fromJS({
          cellId: 'r2,c2',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowLeft, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('ArrowLeft'));

        const expectedPointer = fromJS({
          cellId: 'r0,c3',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowLeft, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c2'));

        store.dispatch(TableActions.movePointer('ArrowLeft'));

        const expectedPointer = fromJS({
          cellId: 'r2,c1',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowLeft, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c0'));

        store.dispatch(TableActions.movePointer('ArrowLeft'));

        const expectedPointer = fromJS({
          cellId: 'r2,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (Home, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('Home'));

        const expectedPointer = fromJS({
          cellId: 'r0,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (Home, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c2'));

        store.dispatch(TableActions.movePointer('Home'));

        const expectedPointer = fromJS({
          cellId: 'r2,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (Home, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c0'));

        store.dispatch(TableActions.movePointer('Home'));

        const expectedPointer = fromJS({
          cellId: 'r2,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowRight, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('ArrowRight'));

        const expectedPointer = fromJS({
          cellId: 'r0,c0',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (ArrowRight, expand)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r0,c3'));

        store.dispatch(TableActions.movePointer('ArrowRight'));

        const expectedColumns = fromJS(['c0',  'c1',  'c2',  'c3',  'c4']);
        const expectedPointer = fromJS({
          cellId: 'r0,c4',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'data', 'columns'])).to.equal(expectedColumns);
        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (End, no initial pos)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state);

        store.dispatch(TableActions.movePointer('End'));

        const expectedPointer = fromJS({
          cellId: 'r0,c3',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (End, OK)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c1'));

        store.dispatch(TableActions.movePointer('End'));

        const expectedPointer = fromJS({
          cellId: 'r2,c3',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });

      it('move pointer (End, border)', () => {
        const state = Core.initialState(...tableSize);
        const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r2,c3'));

        store.dispatch(TableActions.movePointer('End'));

        const expectedPointer = fromJS({
          cellId: 'r2,c3',
          modifiers: {},
        });

        expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
      });
    });
  });

  describe('selection', () => {
    it('set selection', () => {
      const state = Core.initialState(...tableSize);
      const selection = { cellsIds: ['r2,c3'] };
      const store = configureStore(state);

      store.dispatch(TableActions.setSelection(selection));

      const expectedSelection = fromJS(selection);

      expect(store.getState().getIn(['table', 'session', 'selection'])).to.equal(expectedSelection);
    });

    it('clear selection', () => {
      const state = Core.initialState(...tableSize);
      const selection = { cellsIds: ['r2,c3'] };
      const store = configureStore(state.setIn(
        ['table', 'session', 'selection'],
        fromJS(selection)
      ));

      store.dispatch(TableActions.clearSelection());

      const expectedSelection = fromJS({ cellsIds: [] });

      expect(store.getState().getIn(['table', 'session', 'selection'])).to.equal(expectedSelection);
    });
  });

  describe('clipboard', () => {
    it('set clipboard', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const clipboard = {
        cells: {
          'r2,c3': {
            value: '1',
          },
        },
        operation: 'COPY',
      };

      store.dispatch(TableActions.setClipboard(clipboard));

      const expectedClipboard = fromJS(clipboard);

      expect(store.getState().getIn(['table', 'session', 'clipboard'])).to.equal(expectedClipboard);
    });

    it('clear clipboard', () => {
      const state = Core.initialState(...tableSize);
      const clipboard = {
        cells: {
          'r2,c3': {
            value: '1',
          },
        },
        operation: 'COPY',
      };
      const store = configureStore(state.setIn(
        ['table', 'session', 'clipboard'],
        fromJS(clipboard)
      ));

      store.dispatch(TableActions.clearClipboard());

      const expectedClipboard = fromJS({
        cells: [],
        operation: null,
      });

      expect(store.getState().getIn(['table', 'session', 'clipboard'])).to.equal(expectedClipboard);
    });
  });

  describe('update triggers', () => {
    it('toggle row update trigger (set)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const rowId = 'r1';

      store.dispatch(TableActions.toggleRowUpdateTrigger(rowId));

      const expectedUpdateTriggersJS = {
        data: {
          rows: {},
        },
      };
      expectedUpdateTriggersJS.data.rows[rowId] = true;
      const expectedUpdateTriggers = fromJS(expectedUpdateTriggersJS);

      expect(store.getState().getIn(['table', 'updateTriggers'])).to.equal(expectedUpdateTriggers);
    });

    it('toggle row update trigger (unset)', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);
      const rowId = 'r1';

      store.dispatch(TableActions.toggleRowUpdateTrigger(rowId));
      store.dispatch(TableActions.toggleRowUpdateTrigger(rowId));

      const expectedUpdateTriggers = fromJS({
        data: {
          rows: {},
        },
      });

      expect(store.getState().getIn(['table', 'updateTriggers'])).to.equal(expectedUpdateTriggers);
    });
  });

  describe('reduce', () => {
    it('remove row', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r1,c1'));

      store.dispatch(TableActions.reduce([1, -1]));

      const expectedRows = fromJS(['r0', 'r2']);
      const expectedPointer = fromJS({
        cellId: null,
        modifiers: {},
      });

      expect(store.getState().getIn(['table', 'data', 'rows'])).to.equal(expectedRows);
      expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
    });

    it('remove row (only)', () => {
      const state = Core.initialState(1, 4);
      const store = configureStore(state);

      store.dispatch(TableActions.reduce([0, -1]));

      const expectedRows = fromJS(['r0']);

      expect(store.getState().getIn(['table', 'data', 'rows'])).to.equal(expectedRows);
    });

    it('remove column', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state.setIn(['table', 'session', 'pointer', 'cellId'], 'r1,c1'));

      store.dispatch(TableActions.reduce([-1, 1]));

      const expectedColumns = fromJS(['c0', 'c2', 'c3']);
      const expectedPointer = fromJS({
        cellId: null,
        modifiers: {},
      });

      expect(store.getState().getIn(['table', 'data', 'columns'])).to.equal(expectedColumns);
      expect(store.getState().getIn(['table', 'session', 'pointer'])).to.equal(expectedPointer);
    });

    it('remove column (only)', () => {
      const state = Core.initialState(3, 1);
      const store = configureStore(state);

      store.dispatch(TableActions.reduce([-1, 0]));

      const expectedColumns = fromJS(['c0']);

      expect(store.getState().getIn(['table', 'data', 'columns'])).to.equal(expectedColumns);
    });
  });

  describe('expand', () => {
    it('add row', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);

      store.dispatch(TableActions.expand([1, -1]));

      const expectedRows = fromJS(['r0', 'r1a', 'r1', 'r2']);

      expect(store.getState().getIn(['table', 'data', 'rows'])).to.equal(expectedRows);
    });

    it('add column', () => {
      const state = Core.initialState(...tableSize);
      const store = configureStore(state);

      store.dispatch(TableActions.expand([-1, 1]));

      const expectedColumns = fromJS(['c0', 'c1a', 'c1', 'c2', 'c3']);

      expect(store.getState().getIn(['table', 'data', 'columns'])).to.equal(expectedColumns);
    });
  });
});

// TODO: rename to table_reducer_spec?
import { expect } from 'chai';
import {
  fromJS,
  toJS,
} from 'immutable';

import * as Core from '../../core';
import * as TableActions from '../../actions/table';
import configureStore from '../../store/configureStore';

// process.log = (x) => console.log(JSON.stringify(x, null, 2));

describe('table', () => {
  const tableHeight = 3;
  const tableWidth = 4;
  const lastRowNumber = tableHeight - 1;
  const lastColumnNumber = tableWidth - 1;

  // TODO: do it better (checking arbitrary object with RegExp),
  //   also apply this approach to requests.
  // TODO: move everything to helper.
  const expectWithUuids = (table1, table2) => {
    const table1JS = table1.toJS();
    const table2JS = table2.toJS();
    const removeUuids = (table) => {
      table.data.forEach((row) => {
        row.forEach((cell) => {
          delete cell.id;
        });
      })
      return table;
    }

    const table1WOUuids = removeUuids(table1JS);
    const table2WOUuids = removeUuids(table2JS);
    expect(fromJS(table1WOUuids)).to.deep.equal(fromJS(table2WOUuids));
  };

  describe('setters', () => {

    it('should be able to set data', () => {
      const store = configureStore();
      const data = [[1, 2], [2, 3]];

      store.dispatch(TableActions.setData(data));

      // TODO: emptyState()?
      let nextStateExpectedMap = Core.initialState(1, 1).toJS();
      nextStateExpectedMap.table.data = data;
      nextStateExpectedMap.table.selection = Core.defaultSelection(data);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should be able to set a prop', () => {
      const state = Core.initialState(tableHeight, tableWidth);
      const store = configureStore(state);
      const pos = [1, 2];
      const prop = 'value';
      const value = 'Cell value';

      store.dispatch(TableActions.setProp(pos, prop, value));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.data[Core.rowNumber(pos)][Core.columnNumber(pos)][prop] = value;
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should be able to delete a prop', () => {
      const state = Core.initialState(tableHeight, tableWidth);
      const store = configureStore(state);
      const pos = [1, 2];
      const prop = 'value';
      const value = 'Cell value';

      store.dispatch(TableActions.setProp(pos, prop, value));
      store.dispatch(TableActions.deleteProp(pos, prop));

      expect(store.getState().get('table')).to.deep.equal(state.get('table'));
    });

    it('should be able to set hover', () => {
      const state = Core.initialState(tableHeight, tableWidth);
      const store = configureStore(state);
      const pos = [1, 2];

      store.dispatch(TableActions.setHover(pos));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.hover = pos;
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should be able to set pointer', () => {
      const state = Core.initialState(tableHeight, tableWidth);
      const store = configureStore(state);
      const pointer = { pos: [1, 2], modifiers: ['EDIT'] };

      store.dispatch(TableActions.setPointer(pointer.pos, pointer.modifiers));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.pointer = pointer;
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

  });

  describe('user actions', () => {
    const state = Core.initialState(tableHeight, tableWidth).updateIn(
      ['table', 'selection', 0, 1],
      value => true,
    ).updateIn(
      ['table', 'selection', 0, 2],
      value => true,
    );

    const expectNoPointerMovement = (key) => {
      const store = configureStore(state);

      let posNew;
      switch (key) {
        case 'ArrowUp':
        case 'PageDown':
          posNew = [lastRowNumber, 0];
          break;
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageUp':
        case 'Home':
          posNew = [0, 0];
          break;
        case 'ArrowLeft':
        case 'End':
          posNew = [0, lastColumnNumber];
          break;
        default:
      }

      store.dispatch(TableActions.movePointer(key));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.pointer = { pos: posNew, modifiers: [] };
      nextStateExpectedMap.table.selection = Core.defaultSelection(nextStateExpectedMap.table.data);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    }

    const expectOkPointerMovement = (key) => {
      const posOld = [1, 2];

      let posNew;
      switch (key) {
        case 'ArrowUp':
          posNew = [Core.rowNumber(posOld) - 1, Core.columnNumber(posOld)];
          break;
        case 'PageUp':
          posNew = [0,                     Core.columnNumber(posOld)];
          break;
        case 'ArrowDown':
          posNew = [Core.rowNumber(posOld) + 1, Core.columnNumber(posOld)];
          break;
        case 'PageDown':
          posNew = [lastRowNumber,         Core.columnNumber(posOld)];
          break;
        case 'ArrowLeft':
          posNew = [Core.rowNumber(posOld),     Core.columnNumber(posOld) - 1];
          break;
        case 'Home':
          posNew = [Core.rowNumber(posOld),     0];
          break;
        case 'ArrowRight':
          posNew = [Core.rowNumber(posOld),     Core.columnNumber(posOld) + 1];
          break;
        case 'End':
          posNew = [Core.rowNumber(posOld),     lastColumnNumber];
          break;
        default:
      }

      const pointerState = state.setIn(
        ['table', 'pointer'],
        fromJS({ pos: posOld, modifiers: [] }),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.movePointer(key));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.pointer = { pos: posNew, modifiers: [] };
      nextStateExpectedMap.table.selection = Core.defaultSelection(nextStateExpectedMap.table.data);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    }

    const expectBorderPointerMovement = (key) => {
      let posOld;
      switch (key) {
        case 'ArrowUp':
        case 'PageUp':
          posOld = [0, 2];
          break;
        // case 'ArrowDown':
        case 'PageDown':
          posOld = [lastRowNumber, 2];
          break;
        case 'ArrowLeft':
        case 'Home':
          posOld = [2, 0];
          break;
        // case 'ArrowRight':
        case 'End':
          posOld = [2, lastColumnNumber];
          break;
        default:
      }

      const pointerState = state.setIn(
        ['table', 'pointer'],
        fromJS({ pos: posOld, modifiers: [] }),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.movePointer(key));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.selection = Core.defaultSelection(nextStateExpectedMap.table.data);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    };

    describe('pointer movement', () => {

      describe('ArrowUp', () => {
        const key = 'ArrowUp';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (border)', () => {
          expectBorderPointerMovement(key);
        });

      });

      describe('PageUp', () => {
        const key = 'PageUp';

          it('should move pointer (no pointer)', () => {
            expectNoPointerMovement(key);
          });

          it('should move pointer (ok)', () => {
            expectOkPointerMovement(key);
          });

          it('should move pointer (border)', () => {
            expectBorderPointerMovement(key);
          });

        });

        describe('ArrowDown', () => {
          const key = 'ArrowDown';

          it('should move pointer (no pointer)', () => {
            expectNoPointerMovement(key);
          });

          it('should move pointer (ok)', () => {
            expectOkPointerMovement(key);
          });

        it('should move pointer (expand table)', () => {
          const posOld = [lastRowNumber, 2];
          const posNew = [Core.rowNumber(posOld) + 1, Core.columnNumber(posOld)];
          const pointerState = state.setIn(
            ['table', 'pointer'],
            fromJS({ pos: posOld, modifiers: [] }),
          );
          const store = configureStore(pointerState);

          store.dispatch(TableActions.movePointer(key));

          let nextStateExpectedMap = state.toJS();
          nextStateExpectedMap.table.pointer = { pos: posNew, modifiers: [] };
          const newDataRow = Array.from(Array(tableWidth)).map(() => {
            return Core.defaultCell();
          });
          const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
            return undefined;
          });
          nextStateExpectedMap.table.selection[Core.rowNumber(posNew)] = newSelectionRow;
          nextStateExpectedMap.table.data[Core.rowNumber(posNew)] = newDataRow;
          nextStateExpectedMap.table.selection = Core.defaultSelection(nextStateExpectedMap.table.data);
          const nextStateExpected = fromJS(nextStateExpectedMap);
          expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
        });

      });

      describe('PageDown', () => {
        const key = 'PageDown';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (border)', () => {
          expectBorderPointerMovement(key);
        });

      });

      describe('ArrowLeft', () => {
        const key = 'ArrowLeft';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (border)', () => {
          expectBorderPointerMovement(key);
        });

      });

      describe('Home', () => {
        const key = 'Home';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (border)', () => {
          expectBorderPointerMovement(key);
        });

      });

      describe('ArrowRight', () => {
        const key = 'ArrowRight';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (expand table)', () => {
          const posOld = [2, lastColumnNumber];
          const posNew = [Core.rowNumber(posOld), lastColumnNumber + 1];
          const pointerState = state.setIn(
            ['table', 'pointer'],
            fromJS({ pos: posOld, modifiers: [] }),
          );

          const store = configureStore(pointerState);

          store.dispatch(TableActions.movePointer(key));
          let nextStateExpectedMap = state.toJS();
          nextStateExpectedMap.table.data.forEach((row) => {
            row.push(Core.defaultCell());
          });
          nextStateExpectedMap.table.selection.forEach((row) => {
            row.push(undefined);
          });
          nextStateExpectedMap.table.pointer = { pos: posNew, modifiers: [] };
          nextStateExpectedMap.table.selection = Core.defaultSelection(nextStateExpectedMap.table.data);
          const nextStateExpected = fromJS(nextStateExpectedMap);
          expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
        });

      });

      describe('End', () => {
        const key = 'End';

        it('should move pointer (no pointer)', () => {
          expectNoPointerMovement(key);
        });

        it('should move pointer (ok)', () => {
          expectOkPointerMovement(key);
        });

        it('should move pointer (border)', () => {
          expectBorderPointerMovement(key);
        });

      });

    });

  });

  describe('reduce table', () => {
    const state = Core.initialState(3, 4, 'INDEX');

    it('should remove row (no pointer)', () => {
      const pos = [1, -1]
      const store = configureStore(state);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 1);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove row (pointer is upper than that row)', () => {
      const pos = [1, -1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([Core.rowNumber(pos) - 1, 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 1);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove row (pointer is on that row)', () => {
      const pos = [1, -1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([Core.rowNumber(pos), 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.pointer = { pos: [], modifiers: [] };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove row (pointer is lower than that row)', () => {
      const pos = [1, -1];
      const pointerPos = [Core.rowNumber(pos) + 1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS(pointerPos),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 1);
      nextStateExpectedMap.table.pointer = {
        pos: [Core.rowNumber(pointerPos) - 1, Core.columnNumber(pointerPos)],
        modifiers: [],
      };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove column (no pointer)', () => {
      const pos = [-1, 1];
      const store = configureStore(state);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove column (pointer is on column\'s left)', () => {
      const pos = [-1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([1, Core.columnNumber(pos) - 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove column (pointer is on column)', () => {
      const pos = [-1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([1, Core.columnNumber(pos)]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.pointer = { pos: [], modifiers: [] };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

    it('should remove column (pointer is on column\'s right)', () => {
      const pos = [-1, 1];
      const pointerPos = [1, Core.columnNumber(pos) + 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS(pointerPos),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.reduce(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 1);
      });
      nextStateExpectedMap.table.pointer = {
        pos: [Core.rowNumber(pointerPos), Core.columnNumber(pointerPos) - 1],
        modifiers: [],
      };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expect(store.getState().get('table')).to.deep.equal(nextStateExpected.get('table'));
    });

  });

  describe('expand table', () => {
    const state = Core.initialState(3, 4);

    it('should add row (no pointer)', () => {
      const pos = [2, -1]
      const store = configureStore(state);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = state.toJS();
      const newDataRow = Array.from(Array(tableWidth)).map(() => {
        return Core.defaultCell();
      });
      const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
        return undefined;
      });
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 0, newDataRow);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 0, newSelectionRow);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add row (pointer is upper than that row)', () => {
      const pos = [2, -1]
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([Core.rowNumber(pos) - 1, 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      const newDataRow = Array.from(Array(tableWidth)).map(() => {
        return Core.defaultCell();
      });
      const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
        return undefined;
      });
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 0, newDataRow);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 0, newSelectionRow);
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add row (pointer is on that row)', () => {
      const pos = [2, -1]
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([Core.rowNumber(pos), 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      const newDataRow = Array.from(Array(tableWidth)).map(() => {
        return Core.defaultCell();
      });
      const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
        return undefined;
      });
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 0, newDataRow);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 0, newSelectionRow);
      nextStateExpectedMap.table.pointer = { pos: [], modifiers: [] };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add row (pointer is lower than that row)', () => {
      const pos = [2, -1]
      const pointerPos = [Core.rowNumber(pos) + 1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS(pointerPos),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      const newDataRow = Array.from(Array(tableWidth)).map(() => {
        return Core.defaultCell();
      });
      const newSelectionRow = Array.from(Array(tableWidth)).map(() => {
        return undefined;
      });
      nextStateExpectedMap.table.data.splice(Core.rowNumber(pos), 0, newDataRow);
      nextStateExpectedMap.table.selection.splice(Core.rowNumber(pos), 0, newSelectionRow);
      nextStateExpectedMap.table.pointer = {
        pos: [Core.rowNumber(pointerPos) + 1, Core.columnNumber(pointerPos)],
        modifiers: [],
      };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add column (no pointer)', () => {
      const pos = [-1, 1];
      const store = configureStore(state);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = state.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, Core.defaultCell());
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, undefined);
      });
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add column (pointer is on column\'s left)', () => {
      const pos = [-1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([1, Core.columnNumber(pos) - 1]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, Core.defaultCell());
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, undefined);
      });
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add column (pointer is on column)', () => {
      const pos = [-1, 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS([1, Core.columnNumber(pos)]),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, Core.defaultCell());
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, undefined);
      });
      nextStateExpectedMap.table.pointer = { pos: [], modifiers: [] };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

    it('should add column (pointer is on column\'s right)', () => {
      const pos = [-1, 1];
      const pointerPos = [1, Core.columnNumber(pos) + 1];
      const pointerState = state.updateIn(
        ['table', 'pointer', 'pos'],
        value => fromJS(pointerPos),
      );
      const store = configureStore(pointerState);

      store.dispatch(TableActions.expand(pos));

      let nextStateExpectedMap = pointerState.toJS();
      nextStateExpectedMap.table.data.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, Core.defaultCell());
      });
      nextStateExpectedMap.table.selection.forEach((row) => {
        row.splice(Core.columnNumber(pos), 0, undefined);
      });
      nextStateExpectedMap.table.pointer = {
        pos: [Core.rowNumber(pointerPos), Core.columnNumber(pointerPos) + 1],
        modifiers: [],
      };
      const nextStateExpected = fromJS(nextStateExpectedMap);
      expectWithUuids(store.getState().get('table'), nextStateExpected.get('table'));
    });

  });

});

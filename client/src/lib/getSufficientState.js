// NOTE: this is the only point where you get some data from state
//   and prepare it to send somewhere else (not client).
//   Though some code here is trivial, it could be helpful in debugging
//   (that way you can always tell what data to be expected on the other end).
// NOTE: if you change this, review "table/MERGE_SERVER_STATE" action.

import { Iterable } from 'immutable';

export default (args) => {
  let sufficientState;

  // TODO: use isImmutable (or whatever) when available.
  //   https://stackoverflow.com/a/31919411/6376451
  if (Iterable.isIterable(args)) { // handleServerRequests, SpreadsheetCreator, Core.convert() (* => APP)
    const state = args;

    const stateTable = state.get('table');
    let effectiveTable;
    if (Iterable.isIterable(stateTable)) { // SpreadsheetCreator (virgin immutable state), Core.convert() (* => APP)
      effectiveTable = stateTable;
    } else { // handleServerRequests, undo-redo state
      effectiveTable = stateTable.present;
    }

    sufficientState = {
      settings: state.get('settings').toJS(),
      table: effectiveTable
              .delete('minor')
              .deleteIn(['major', 'session'])
              .deleteIn(['major', 'vision'])
              .toJS(),
    };
  } else { // Core.convert() (APP => JSON)
    sufficientState = {
      settings: args.settings,
      table: args.table,
    };
  }

  return sufficientState;
};

// NOTE: this is the only point where you get some data from state
//   and prepare it to send somewhere else (not client).
//   Though some code here is trivial, it could be helpful in debugging
//   (that way you can always tell what data to be expected on the other end).
// NOTE: if you change this, review "table/MERGE_SERVER_STATE" action.

import produce from 'immer';


export default (state) => {
  let sufficientState;

  let effectiveTable;
  if (state.table.present) { // handleServerRequests, undo-redo state
    effectiveTable = state.table.present;
  } else { // SpreadsheetCreator (virgin immutable state), Core.convert() (* => APP)
    effectiveTable = state.table;
  }

  sufficientState = {
    settings: state.settings,
    table: produce(effectiveTable, draft => {
      if (draft.minor) { // doesn't exist in Core.convert due to data passing there
        delete draft.minor;
      }
      if (draft.major && draft.major.session) { // the same
        delete draft.major.session
      }
      if (draft.major && draft.major.vision) { // the same
        delete draft.major.vision;
      }
    }),
  }
  return sufficientState;
};

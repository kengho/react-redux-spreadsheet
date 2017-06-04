import { ActionCreators as UndoActionCreators } from 'redux-undo';

export function undo() {
  const undoAction = UndoActionCreators.undo();

  // changesData is added for server sync through handleDataChanges() middleware.
  undoAction.changesData = true;

  return undoAction;
}

export function redo() {
  const redoAction = UndoActionCreators.redo();
  redoAction.changesData = true;

  return redoAction;
}

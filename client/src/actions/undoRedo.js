import { ActionCreators as UndoActionCreators } from 'redux-undo';

export function undo() {
  const undoAction = UndoActionCreators.undo();

  // changesData is added for server sync through pushRequestOnDataChanges() middleware.
  undoAction.changesData = true;

  return undoAction;
}

export function redo() {
  const redoAction = UndoActionCreators.redo();
  redoAction.changesData = true;

  return redoAction;
}

export function clearHistory() {
  return UndoActionCreators.clearHistory();
}

import { getRowId } from '../../core';
import { tableSetRowUpdateTrigger } from '../../actions/table';

// This middleware analyzes action and it's consequences and
// triggers appropriate Row re-render by dispatching tableSetRowUpdateTrigger().
// TABLE/SET_HOVER affects only first Row, so it doesn't catched here.
const detectRowUpdatesNeed = store => next => action => { // eslint-disable-line consistent-return
  const regex = new RegExp(/([^/]*)\/([^/]*)/);
  const regexGroups = { BranchName: 1, Action: 2 };

  const actionTypeMatch = action.type.match(regex);
  if (!(actionTypeMatch && action.triggersRowUpdate)) {
    return next(action);
  }

  if (action.cellId && !action.propsComparePaths && !action.cellIdGetter) {
    store.dispatch(tableSetRowUpdateTrigger(getRowId(action.cellId)));

    return next(action);
  }

  const stateBranchName = actionTypeMatch[regexGroups.BranchName].toLowerCase();

  let getBranchState;
  if (stateBranchName === 'table') {
    getBranchState = () => store.getState().get(stateBranchName).present;
  } else {
    // getBranchState = ...
  }

  const getInPath = (path) => getBranchState().getIn(path);

  const getCellId = (action) => {
    const { cellId, cellIdPath, cellIdGetter } = action;

    let nextCellId;
    if (cellIdPath) {
      nextCellId = getInPath(cellIdPath);
    } else if (cellIdGetter) {
      nextCellId = action.cellIdGetter(getBranchState());
    } else {
      nextCellId = cellId;
    }

    return nextCellId;
  };

  const getPropsToCompare = (paths) => paths.map((path) => getInPath(path));

  // Get previous data.
  const previousCellId = getCellId(action);
  let previousPropsToCompare;
  if (action.propsComparePaths) {
    previousPropsToCompare = getPropsToCompare(action.propsComparePaths);
  }

  const nextAction = next(action);

  // Get next data.
  const nextCellId = getCellId(action);
  let nextPropsToCompare;
  if (action.propsComparePaths) {
    nextPropsToCompare = getPropsToCompare(action.propsComparePaths);
  }

  // Compare data and fill changingRowIds.

  const changingRowIds = [];

  // Detect direct cellId changes.
  if (previousCellId && nextCellId) {
    if (previousCellId !== nextCellId) {
      changingRowIds.push(getRowId(previousCellId), getRowId(nextCellId));
    }
  } else if (previousCellId) {
    changingRowIds.push(getRowId(previousCellId));
  } else if (nextCellId) {
    changingRowIds.push(getRowId(nextCellId));
  }

  // Detect additional props' changes.
  let propsToCompareChanged = false;
  if (
    previousPropsToCompare && previousPropsToCompare.length > 0 &&
    nextPropsToCompare && nextPropsToCompare.length > 0
  ) {
    // NOTE: propsToCompare[n] is immutable, so comparing is simple.
    //   To avoid false poisitives in propsToCompareChanged (leading to unnecessary re-renders),
    //   reducer shouldn't mutate state is there are no changes.
    propsToCompareChanged = previousPropsToCompare.some((value, index) => {
      return (nextPropsToCompare[index] !== value);
    })
  }
  if (propsToCompareChanged) {
    changingRowIds.push(getRowId(getCellId(action)));
  }

  // ~Array.uniq:
  // https://stackoverflow.com/questions/1960473/unique-values-in-an-array#comment68618078_14438954
  const changingRowIdsUniq = [...new Set(changingRowIds)];
  if (changingRowIdsUniq.length > 0) {
    store.dispatch(tableSetRowUpdateTrigger(changingRowIdsUniq));
  }

  return nextAction;
};

export default detectRowUpdatesNeed;

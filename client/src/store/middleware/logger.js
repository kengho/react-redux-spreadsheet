// https://redux.js.org/advanced/middleware
const logger = store => next => action => {
  console.group(action.type);
  if (action.subType) {
    console.info(action.subType);
  }
  console.info(action);
  let result = next(action);
  console.info(store.getState());
  console.groupEnd();

  return result;
}

export default logger;

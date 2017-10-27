import { List } from 'immutable';

const serverSyncParams = (table) => {
  // TODO: consider storing session data.
  const syncingStateBranches = List(['data']);

  return { table: JSON.stringify(table, syncingStateBranches) };
};

export default serverSyncParams;

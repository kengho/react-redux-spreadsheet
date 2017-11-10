// TODO: test that is deletes session.
const serverSyncParams = (table) => {
  // TODO: consider storing session data.
  const syncingStateBranches = ['data'];

  const filteredTable = table.filter(
    (value, key) => {
      if (syncingStateBranches.indexOf(key) === -1) {
        return false;
      }
      return true;
    }
  )

  return { table: JSON.stringify(filteredTable) };
};

export default serverSyncParams;

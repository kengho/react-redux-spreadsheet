// TODO: test that it deletes session.
export default (table, settings) => {
  // TODO: consider storing session data.
  const syncingTableBranches = ['layout'];

  const filteredTable = table.filter(
    (value, key) => {
      if (!syncingTableBranches.includes(key)) {
        return false;
      }
      return true;
    }
  );

  return {
    table: JSON.stringify(filteredTable),
    settings: JSON.stringify(settings),
  };
};

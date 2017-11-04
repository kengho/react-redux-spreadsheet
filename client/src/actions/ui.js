export function uiOpen(kind, params) {
  return {
    type: 'UI/OPEN',
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
    kind,
    params,
  };
}

export function uiClose() {
  return {
    type: 'UI/CLOSE',
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
  };
}

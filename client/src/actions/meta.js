export function metaSetShortId(shortId) { // eslint-disable-line import/prefer-default-export
  return {
    type: 'META/SET_SHORT_ID',
    shortId,
  };
}

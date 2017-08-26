export function setMessages(messages) { // eslint-disable-line import/prefer-default-export
  return {
    type: 'SET_MESSAGES',
    messages,
  };
}

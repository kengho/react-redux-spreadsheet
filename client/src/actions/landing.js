export function setMessages(messages) {
  return {
    type: 'SET_MESSAGES',
    messages,
  };
}

export function disableLandingButton(disable) {
  return {
    type: 'DISABLE_LANDING_BUTTON',
    disable,
  };
}

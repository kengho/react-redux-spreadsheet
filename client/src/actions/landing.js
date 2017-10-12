export function landingSetMessages(messages) {
  return {
    type: 'LANDING/SET_MESSAGES',
    messages,
  };
}

export function landingDisableButton(disable) {
  return {
    type: 'LANDING/DISABLE_LANDING_BUTTON',
    disable,
  };
}

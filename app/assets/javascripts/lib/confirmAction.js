const confirmAction = (action) => {
  const dialog = document.querySelector('dialog'); // eslint-disable-line no-undef
  if (dialog && dialog.showModal) {
    dialog.showModal();
  } else {
    return;
  }

  const yesButton = dialog.querySelector('#dialog-button--yes');
  if (yesButton) {
    yesButton.onclick = action;
  }
};

export default confirmAction;

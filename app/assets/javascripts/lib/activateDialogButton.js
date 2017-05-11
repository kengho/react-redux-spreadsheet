const activateDialogButton = (dialog, key) => {
  let nextActiveButton;
  if (key === 'ArrowLeft') {
    nextActiveButton = dialog.querySelector('button:last-child');
  } else if (key === 'ArrowRight') {
    nextActiveButton = dialog.querySelector('button:first-child');
  }

  nextActiveButton.focus();
};

export default activateDialogButton;

import React from 'react';

const Dialog = () => {
  const buttonsMap = [
    {
      idPostfix: 'yes',
      label: 'Yes',
    },
    {
      idPostfix: 'no',
      label: 'No, go back',
    },
  ];

  const buttons = [];
  buttonsMap.forEach((buttonMap) => {
    buttons.push(
      // id uses in lib/confirmAction.js
      <button
        className="mdl-button"
        id={`dialog-button--${buttonMap.idPostfix}`}
        key={`dialog-button--${buttonMap.idPostfix}`}
        onClick={(e) => e.target.parentNode.parentNode.close()}
        type="button"
      >
        {buttonMap.label}
      </button>
    );
  });

  return (
    <dialog className="mdl-dialog">
      <h4 className="mdl-dialog__title">Confirm action</h4>
      <div className="mdl-dialog__content">
        <p>Are you sure?</p>
      </div>
      <div className="mdl-dialog__actions">
        {buttons}
      </div>
    </dialog>
  );
};

export default Dialog;

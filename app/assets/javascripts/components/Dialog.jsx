import React from 'react';

const Dialog = () => {
  const buttonsMap = [
    {
      label: 'Yes',
      idPostfix: 'yes',
    },
    {
      label: 'No, go back',
      idPostfix: 'no',
    },
  ];

  const buttons = [];
  buttonsMap.forEach((buttonMap) => {
    buttons.push(
      // id uses in lib/confirmAction.js
      <button
        key={`dialog-button--${buttonMap.idPostfix}`}
        id={`dialog-button--${buttonMap.idPostfix}`}
        type="button"
        className="mdl-button"
        onClick={(e) => e.target.parentNode.parentNode.close()}
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

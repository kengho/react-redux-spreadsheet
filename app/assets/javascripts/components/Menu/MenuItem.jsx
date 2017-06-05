import PropTypes from 'prop-types';
import React from 'react';

import showDialogAndBindAction from '../../lib/showDialogAndBindAction';

const propTypes = {
  action: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  dialogVariant: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
};

const defaultProps = {
  dialogVariant: '',
  icon: '',
};

const DELAY_BEFORE_ACTION = 200;

const MenuItem = (props) => {
  const {
    action,
    actions,
    dialogVariant,
    icon,
    label,
  } = props;

  let effectiveAction;
  if (dialogVariant) {
    effectiveAction = () => {
      actions.setDialogVariant(dialogVariant);

      // TODO: make dialog completely in React-way.
      //   Caveat: dialog.showModal() and dialog.close() throws exceptions.
      showDialogAndBindAction(action);
    };
  } else {
    effectiveAction = action;
  }

  // Delay action until ripple animation isn't finished.
  const delayedAction = () => {
    setTimeout(
      effectiveAction,
      DELAY_BEFORE_ACTION
    );
  };

  return (
    <li
      className="mdl-menu__item"
      onClick={delayedAction}
    >
      {/* Emply icon works just fine, occupying the same space as regular one. */}
      <i className="material-icons md-18">{icon}</i>
      {label}
    </li>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

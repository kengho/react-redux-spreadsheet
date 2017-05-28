import PropTypes from 'prop-types';
import React from 'react';

import confirmAction from '../../lib/confirmAction';

const propTypes = {
  action: PropTypes.func.isRequired,
  confirm: PropTypes.bool,
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
};

const defaultProps = {
  confirm: false,
  icon: '',
};

const DELAY_BEFORE_ACTION = 200;

const MenuItem = (props) => {
  const {
    action,
    confirm,
    icon,
    label,
  } = props;

  let effectiveAction;
  if (!confirm) {
    effectiveAction = action;
  } else {
    effectiveAction = () => confirmAction(action);
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

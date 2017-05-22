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
  icon: '',
  confirm: false,
};

const DELAY_BEFORE_ACTION = 200;

const MenuItem = (props) => {
  let action;
  if (!props.confirm) {
    action = props.action;
  } else {
    action = () => confirmAction(props.action);
  }

  // Delay action until ripple animation isn't finished.
  const delayedAction = () => {
    setTimeout(
      action,
      DELAY_BEFORE_ACTION
    );
  };

  return (
    <li
      className="mdl-menu__item"
      onClick={delayedAction}
    >
      {/* Emply icon works just fine, occupying the same space. */}
      <i className="material-icons md-18">{props.icon}</i>
      {props.label}
    </li>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

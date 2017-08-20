import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  // REVIEW: since all our actions can be expressed as plain objects,
  //   shouldn't we leave only PropTypes.object here?
  //   Caveat: it requires importing actions/* into components directly, which seems not right.
  //   Is there a way to 'unconnect' actions from dispach() (funtions back to objects)?
  action: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  actions: PropTypes.object.isRequired,
  dialogVariant: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const defaultProps = {
  action: {},
  dialogVariant: '',
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
  if (dialogVariant && typeof action === 'object') {
    effectiveAction = () => {
      actions.setDialog({
        action,
        variant: dialogVariant,
        visibility: true,
      });
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

  let Icon = require(`react-icons/lib/md/${icon}`);

  return (
    <li
      className="mdl-menu__item"
      onClick={delayedAction}
    >
      {/* Emply icon works just fine, occupying the same space as regular one. */}
      <Icon size={24} />
      {label}
    </li>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

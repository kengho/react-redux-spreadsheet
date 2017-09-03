import PropTypes from 'prop-types';
import React from 'react';
import { MenuItem as MaterialMenuItem } from 'material-ui/Menu';

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
  dialogDisableYesButton: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

const defaultProps = {
  action: {},
  dialogVariant: '',
  dialogDisableYesButton: false,
};

const DELAY_BEFORE_ACTION = 200;

const MenuItem = (props) => {
  const {
    action,
    actions,
    children,
    dialogDisableYesButton,
    dialogVariant,
    closeMenu,
  } = props;

  let effectiveAction;
  if (dialogVariant && typeof action === 'object') {
    effectiveAction = () => {
      actions.setDialog({
        action,
        disableYesButton: dialogDisableYesButton,
        variant: dialogVariant,
        open: true,
      });
      closeMenu();
    };
  } else {
    effectiveAction = () => {
      action();
      closeMenu();
    };
  }

  // Delay action until ripple animation isn't finished.
  const delayedAction = () => {
    setTimeout(
      effectiveAction,
      DELAY_BEFORE_ACTION
    );
  };

  return (
    <MaterialMenuItem
      onClick={delayedAction}
    >
      {children}
    </MaterialMenuItem>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

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
  disabled: PropTypes.bool,
};

const defaultProps = {
  action: {},
  dialogDisableYesButton: false,
  dialogVariant: '',
  disabled: false,
};

// TODO: import from somewhere and reuse in CellHistory.
const DELAY_BEFORE_ACTION = 200;

const MenuItem = (props) => {
  const {
    action,
    actions,
    children,
    dialogDisableYesButton,
    dialogVariant,
    disabled,
  } = props;

  let effectiveAction;
  if (disabled) {
    effectiveAction = () => {};
  } else if (dialogVariant && typeof action === 'object') {
    effectiveAction = () => {
      actions.uiClose();
      actions.uiSetDialog({
        action,
        disableYesButton: dialogDisableYesButton,
        variant: dialogVariant,
        open: true,
      });
    };
  } else {
    effectiveAction = () => {
      // NOTE: order of actions is important.
      //   If action is to open ui, it should be called after closing it.
      actions.uiClose();
      action();
    };
  }

  // Delay action until ripple animation isn't finished.
  const delayedAction = (evt) => {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    setTimeout(
      effectiveAction,
      DELAY_BEFORE_ACTION
    );
  };

  return (
    <MaterialMenuItem
      onClick={delayedAction}
      disabled={disabled}
    >
      {children}
    </MaterialMenuItem>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

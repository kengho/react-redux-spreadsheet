import PropTypes from 'prop-types';
import React from 'react';
import { MenuItem as MaterialMenuItem } from 'material-ui/Menu';

import rippleButtonAction from '../../lib/rippleButtonAction';

const propTypes = {
  action: PropTypes.func,
  actions: PropTypes.object.isRequired,
  dialogVariant: PropTypes.string,
  dialogDisableYesButton: PropTypes.bool,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

const defaultProps = {
  action: () => {},
  dialogDisableYesButton: false,
  dialogVariant: '',
  disabled: false,
};

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
  } else if (dialogVariant) {
    effectiveAction = () => {
      actions.openUi('DIALOG', {
        disableYesButton: dialogDisableYesButton,
        variant: dialogVariant,
      });
    };
  } else {
    effectiveAction = () => {
      // NOTE: order of actions is important.
      //   If action is to open ui, it should be called after closing it.
      actions.closeUi();
      action();
    };
  }

  const delayedAction = rippleButtonAction(effectiveAction);

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

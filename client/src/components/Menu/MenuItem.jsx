import PropTypes from 'prop-types';
import React from 'react';
import { MenuItem as MaterialMenuItem } from 'material-ui/Menu';

import rippleButtonAction from '../../lib/rippleButtonAction';

const propTypes = {
  action: PropTypes.func,
  actions: PropTypes.object.isRequired,
  customComponent: PropTypes.bool,
  dialogDisableYesButton: PropTypes.bool,
  dialogVariant: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  action: () => {},
  customComponent: false,
  dialogDisableYesButton: false,
  dialogVariant: '',
  disabled: false,
};

const MenuItem = (props) => {
  const {
    action,
    actions,
    children,
    customComponent,
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

  let delayedAction;
  if (customComponent) {
    delayedAction = (evt) => { evt.nativeEvent.stopImmediatePropagation(); };
  } else {
    delayedAction = rippleButtonAction(effectiveAction);
  }

  // NOTE: onClick() on div wrapper prevents propagation of onClick on
  //   disabled MenuItem. Such items doesn't handle own onClick() events,
  //   which leads to bubbling event to document unless stopeed here.
  //   It couldn't be stopped on Menu, because it leads to unability to close
  //   UI by clicking on document at all.
  let wrapperOnClickHandler;
  if (disabled) {
    wrapperOnClickHandler = (evt) => { evt.nativeEvent.stopImmediatePropagation(); };
  } else {
    wrapperOnClickHandler = () => {};
  }
  return (
    <div onClick={wrapperOnClickHandler}>
      <MaterialMenuItem
        disabled={disabled}
        onClick={delayedAction}
      >
        {children}
      </MaterialMenuItem>
    </div>
  );
};

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;

export default MenuItem;

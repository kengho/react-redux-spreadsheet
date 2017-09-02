import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';
import MenuItem from './MenuItem';

const propTypes = {
  actions: PropTypes.object.isRequired,
  buttonIcon: PropTypes.string,
  buttonId: PropTypes.string.isRequired,
  hideOnMouseLeave: PropTypes.bool,
  isOnly: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  menuItems: PropTypes.array.isRequired,
  pos: PropTypes.array, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
  buttonIcon: '',
  hideOnMouseLeave: true,

  // Defaults for Menu in TableActionsCell.
  isOnly: false,
  pos: [],
};

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.keyDownHandler = (evt) => {
      // TODO: ArrowLeft and ArrowRight to jump to adjacent menu.
      // Prevents firing documentKeyDownHandler() and lets MDL handler to work.
      evt.nativeEvent.stopImmediatePropagation();
    };

    this.cellActionsMenuOnMouseLeaveHandler = () => {
      // 'is-visible' class applies to '.mdl-menu__container', parent of '.mdl-menu'.
      // ('MaterialMenu.toggle()' causes bugs when user click on list item
      // and moves mouse fast after that.)
      const container = this.menu.parentNode;
      container.classList.remove('is-visible');
    };

    this.menu = null;
  }

  componentDidMount() {
    componentHandler.upgradeElement(this.menu); // eslint-disable-line no-undef
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['isOnly', 'pos']);
  }

  render() {
    const {
      actions,
      buttonIcon,
      buttonId,
      hideOnMouseLeave,
      menuItems,
    } = this.props;

    let ButtonIcon = require(`react-icons/lib/md/${buttonIcon}`);

    const outputMenuItems = [];
    menuItems.forEach((item) => {
      outputMenuItems.push(
        <MenuItem
          action={item.action}
          actions={actions}
          dialogDisableYesButton={item.dialogDisableYesButton}
          dialogVariant={item.dialogVariant}
          icon={item.icon}
          key={`menu-button-${buttonId}-${item.label}`}
          label={item.label}
        />
      );
    });

    return (
      <div
        className="menu"
        onKeyDown={this.keyDownHandler}
        onMouseLeave={hideOnMouseLeave && (() => this.cellActionsMenuOnMouseLeaveHandler())}
      >
        <button
          className="mdl-button mdl-js-button mdl-button--icon"
          id={buttonId}
          onClick={
            () => {
              setTimeout(() => {
                // REVIEW: this should be placed somewhere after this line:
                //   https://github.com/google/material-design-lite/blob/
                //   fd21836fd49d94270e58b252187ebe93410209e4/src/menu/menu.js#L404
                //   But I didn't find better way to do so because of it's delays
                //   (excluding overriding entire MaterialMenu.prototype.show).
                //   Here we wait until animation stops and the focusing on first menu item.
                // TODO: focus on '0-th' menu item somehow, so ArrowDown goes to 1st.
                this.menu.querySelector('li').focus();
              }, 100);
            }
          }
        >
          <ButtonIcon size={24} />
        </button>

        { /* blur unfocuses previously focused menu item when user uses mouse. */ }
        <ul
          className="mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect"
          htmlFor={buttonId}
          onMouseOver={(evt) => { evt.target.blur(); }}
          ref={(c) => { this.menu = c; }}
        >
          {outputMenuItems}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;

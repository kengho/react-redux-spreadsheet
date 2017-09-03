import IconButton from 'material-ui/IconButton';
import MaterialMenu from 'material-ui/Menu';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';
import MenuItem from './MenuItem';

const propTypes = {
  actions: PropTypes.object.isRequired,
  icon: PropTypes.string.isRequired,
  cellId: PropTypes.string.isRequired,
  menuItems: PropTypes.array.isRequired,
  menuVisibility: PropTypes.bool.isRequired,
};

const defaultProps = {
  menuVisibility: false,
};

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.closeMenu = this.closeMenu.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'menuItems',
      'menuVisibility',
    ]);
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    this.anchorEl = evt.currentTarget;
    this.props.actions.closeAllMenus();
    this.props.actions.openMenu(this.props.cellId);
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler() and lets MDL handler to work.
    evt.nativeEvent.stopImmediatePropagation();

    // TODO: goto adjacent menu via arrows.
    if (evt.key === 'Escape') {
      this.props.actions.closeMenu(this.props.cellId);
    }
  }

  closeMenu() {
    this.props.actions.closeMenu(this.props.cellId);
  }

  render() {
    const {
      cellId,
      icon,
      menuItems,
      menuVisibility,
    } = this.props;

    const MenuIcon = require(`material-ui-icons/${icon}`).default;

    // TODO: add background hover color.
    return (
      <div
        className="menu"
      >
        <IconButton
          onClick={this.onClickHandler}
        >
          <MenuIcon />
        </IconButton>

        { /* onMouseOver ... blur() unfocuses previously focused menu item when user uses mouse. */ }
        <MaterialMenu
          anchorEl={this.anchorEl}
          onKeyDown={this.keyDownHandler}
          onMouseOver={(evt) => evt.target.blur()}
          open={menuVisibility}
        >
          {menuItems.map((item) => {
            const ItemIcon = require(`material-ui-icons/${item.icon}`).default;

            return (
              <MenuItem
                {...this.props}
                {...item}
                closeMenu={this.closeMenu}
                key={item.label}
              >
                <ItemIcon size={24} />
                {item.label}
              </MenuItem>
            );
          })}
        </MaterialMenu>
      </div>
    );
  }
}

Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;

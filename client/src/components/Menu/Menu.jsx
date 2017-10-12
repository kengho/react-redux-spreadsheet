import IconButton from 'material-ui/IconButton';
import MaterialMenu from 'material-ui/Menu';
import PropTypes from 'prop-types';
import React from 'react';

import './Menu.css';
import getDOM from '../../lib/getDOM';
import MenuItem from './MenuItem';

const propTypes = {
  actions: PropTypes.object.isRequired,
  icon: PropTypes.string.isRequired,
  iconScale: PropTypes.string,
  menuId: PropTypes.string.isRequired,
  menuItems: PropTypes.array.isRequired,
  menuVisibility: PropTypes.bool.isRequired,
  nextMenuId: PropTypes.string,
  previousMenuId: PropTypes.string,
};

const defaultProps = {
  menuVisibility: false,
  iconScale: 'big',
};

class Menu extends React.PureComponent {
  constructor(props) {
    super(props);

    this.closeMenu = this.closeMenu.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);

    this.buttonId = `${props.menuId}-menu-button`;
    this.getButtonDOM = () => getDOM(this.buttonId);

    this.menuId = `${props.menuId}-menu`;
    this.getMenuDOM = () => getDOM(this.menuId);
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    this.props.actions.uiCloseAll('menu');
    this.props.actions.uiOpen('menu', this.props.menuId);
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler() and lets MDL handler to work.
    evt.nativeEvent.stopImmediatePropagation();

    const {
      actions,
      menuId,
      nextMenuId,
      previousMenuId,
    } = this.props;

    if (evt.key === 'Escape') {
      actions.uiClose('menu', menuId);
    } else if (evt.key === 'ArrowLeft' && previousMenuId) {
      actions.uiClose('menu', menuId);
      actions.uiOpen('menu', previousMenuId);
    } else if (evt.key === 'ArrowRight' && nextMenuId) {
      actions.uiClose('menu', menuId);
      actions.uiOpen('menu', nextMenuId);
    }
  }

  componentDidMount() {
    // HACK: getting button DOM for menu to mount in proper place.
    //   Official way is to get it during click:
    //   // (event) => { this.anchorEl = event.currentTarget } // on button
    //
    //   But I need to open menu programmatically (for ArrowLeft/ArrowRight hotkeys)
    //   and I couldn't find a good way to do it w/o click.
    //
    //   This also works, but seems like another hack of the same magnitude:
    //   // this.menuWrapper = this.refs.IconButton._reactInternalInstance._hostParent._hostNode;
    //   // if (this.button) {
    //   //   this.anchorEl = this.menuWrapper.querySelector('button');
    //   // }
    // TODO: fix. File issue or wait for API to change.
    // this.button = document.querySelector(`#cell-${this.queryid}-menu-button`);
    this.button = this.getButtonDOM();
  }

  componentDidUpdate() {
    // HACK: getting menu DOM for focusing <li> after ArrowLeft/ArrowRight.
    //   It couldn't be derived from this.button, because menu mounts into
    //   entirely separated DOM part.
    // HACK: without setTimeout() after first time pressing
    //   ArrowLeft/ArrowRight on menu focus is losing immediately
    //   (domready doesn't help; 200 ms are not enough).
    // TODO: fix.
    const menu = this.getMenuDOM();
    if (menu) {
      const firstMenuItem = menu.querySelector('li');
      if (firstMenuItem) {
        setTimeout(() => firstMenuItem.focus(), 300);
      }
    }
  }

  closeMenu() {
    this.props.actions.uiClose('menu', this.props.menuId);
  }

  render() {
    const {
      actions, // uses in both Menu and MenuItem
      icon,
      iconScale,
      menuItems,
      menuVisibility,
      ...other,
    } = this.props;

    const MenuIcon = require(`material-ui-icons/${icon}`).default;
    const classnames = ['menu'];
    switch (iconScale) {
      case 'big':
        classnames.push('big');
        break;

      case 'small':
        classnames.push('small');
        break;
      default:

    }

    // ids for componentDidMount() and componentDidUpdate().
    return (
      <div
        className={classnames.join(' ')}
      >
        <IconButton
          id={this.buttonId}
          onClick={this.onClickHandler}
        >
          <MenuIcon />
        </IconButton>
        <MaterialMenu
          anchorEl={this.button}
          id={this.menuId}
          onKeyDown={this.keyDownHandler}
          open={menuVisibility}
        >
          {menuItems.map((item) => {
            const ItemIcon = require(`material-ui-icons/${item.icon}`).default;

            // NOTE: passing closeMenu() instead of cellId because
            //   MenuItem shouldn't know about cellId.
            return (
              <MenuItem
                {...other}
                {...item}
                actions={actions}
                closeMenu={this.closeMenu}
                disabled={item.disabled}
                key={item.label}
              >
                <ItemIcon />
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

import IconButton from 'material-ui/IconButton';
import MaterialMenu from 'material-ui/Menu';
import PropTypes from 'prop-types';
import React from 'react';

import './Menu.css';
import getDOM from '../../lib/getDOM';
import MenuItem from './MenuItem';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string,
  currentUi: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  icon: PropTypes.string.isRequired,
  iconScale: PropTypes.string,
  menuItems: PropTypes.array.isRequired,
  nextMenuCellId: PropTypes.string,
  nextMenuPlace: PropTypes.string,
  place: PropTypes.string.isRequired,
  previousMenuCellId: PropTypes.string,
  previousMenuPlace: PropTypes.string,
};

const defaultProps = {
  cellId: '',
  currentUi: false,
  iconScale: 'big',
};

class Menu extends React.PureComponent {
  constructor(props) {
    super(props);

    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);

    const {
      cellId,
      place,
    } = props;

    this.menuId = `${place.toLowerCase()}-menu`;
    if (cellId !== '') {
      this.menuId = `${cellId}-${this.menuId}`;
    }

    this.buttonId = `${this.menuId}-button`;
    this.getButtonDOM = () => getDOM(this.buttonId);
    this.getMenuDOM = () => getDOM(this.menuId);
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const {
      cellId,
      place,
    } = this.props;

    this.props.actions.uiOpen('MENU', cellId, place);
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler() and lets MDL handler to work.
    evt.nativeEvent.stopImmediatePropagation();

    const {
      actions,
      nextMenuCellId,
      nextMenuPlace,
      previousMenuCellId,
      previousMenuPlace,
    } = this.props;

    if (evt.key === 'Escape') {
      actions.uiClose();
    } else if (
      // TODO: scroll into view.
      evt.key === 'ArrowLeft' &&
      (previousMenuCellId || previousMenuPlace === 'TABLE') &&
      previousMenuPlace
    ) {
      actions.uiOpen('MENU', previousMenuCellId, previousMenuPlace);
    } else if (
      evt.key === 'ArrowRight' &&
      (nextMenuCellId || nextMenuPlace === 'TABLE') &&
      nextMenuPlace
    ) {
      actions.uiOpen('MENU', nextMenuCellId, nextMenuPlace);
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

  render() {
    // Extracting props.
    const {
      cellId,
      currentUi,
      icon,
      iconScale,
      menuItems,
      place,
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

    let visibility = currentUi;
    if (typeof currentUi === 'object') {
      const currentUiKind = currentUi.get('kind');
      const currentUiVisibility = currentUi.get('visibility');
      const currentUiPlace = currentUi.get('place');
      const currentUiCellId = currentUi.get('cellId');

      visibility =
        currentUiVisibility &&
        currentUiKind === 'MENU' &&
        currentUiPlace === place;
      if (cellId) {
        visibility = visibility && (currentUiCellId === cellId);
      }
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
        {visibility &&
          <MaterialMenu
            anchorEl={this.button}
            id={this.menuId}
            onKeyDown={this.keyDownHandler}
            open={visibility}
          >
            {menuItems.map((item) => {
              // TODO: unable to add deviders because of
              //   broken keyboard navigation thorough them.
              // if (React.isValidElement(item)) {
              //   return item;
              // }

              const ItemIcon = require(`material-ui-icons/${item.icon}`).default;

              return (
                <MenuItem
                  disabled={item.disabled}
                  key={item.label}
                  {...item}
                  {...other}
                >
                  <ItemIcon />
                  {item.label}
                </MenuItem>
              );
            })}
          </MaterialMenu>
        }
      </div>
    );
  }
}

Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;

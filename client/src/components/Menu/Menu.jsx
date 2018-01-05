import IconButton from 'material-ui/IconButton';
import MaterialMenu from 'material-ui/Menu';
import PropTypes from 'prop-types';
import React from 'react';

import './Menu.css';
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
  place: PropTypes.string.isRequired,
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
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    this.anchorEl = evt.currentTarget;

    const {
      cellId,
      place,
    } = this.props;

    this.props.actions.openUi('MENU', { cellId, place });
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler() and lets MDL handler to work.
    evt.nativeEvent.stopImmediatePropagation();

    if (evt.key === 'Escape') {
      this.props.actions.closeUi();
    }
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

    // NOTE: ids for componentDidMount() and componentDidUpdate().
    return (
      <div
        className={classnames.join(' ')}
      >
        <IconButton onClick={this.onClickHandler} >
          <MenuIcon />
        </IconButton>
        {visibility &&
          <MaterialMenu
            anchorEl={this.anchorEl}
            className="material-menu"
            onKeyDown={this.keyDownHandler}
            open={visibility}
          >
            {menuItems.map((item) => {
              // TODO: unable to add deviders because of
              //   broken keyboard navigation thorough them.
              // if (React.isValidElement(item)) {
              //   return item;
              // }

              // NOTE: customComponent prevents closeUi() after click in MenuItem.
              return (
                <MenuItem
                  disabled={item.disabled}
                  key={item.label ? item.label : item.component.key}
                  customComponent={!!item.component}
                  {...item}
                  {...other}
                >
                  {item.label ? item.label : item.component}
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

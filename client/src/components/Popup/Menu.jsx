import domready from 'domready';
import MaterialMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';

import cellMenuItems from './cellMenuItems';
import cellAreaMenuItems from './cellAreaMenuItems';
import findKeyAction from '../../lib/findKeyAction';
import gridMenuItems from './gridMenuItems';
import lineHeaderMenuItems from './lineHeaderMenuItems';
import Popup from './Popup';
import rippleButtonAction from '../../lib/rippleButtonAction';

import {
  CELL_AREA,
  CELL,
  COLUMN,
  GRID_HEADER,
  LINE_HEADER,
  MENU,
  ROW,
} from '../../constants';

const propTypes = {
  actions: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
};

class Menu extends React.Component {
  componentDidUpdate() {
    // test_420
    // HACK: for some reason (c), somewhere between MaterialMenu's handleEnter()
    //   and Menu keyDownHandler() the focus in lost. But we need it in order to do
    //   MUI keyboard handlers to work (ArrowDown, ArrowUp) (see findKeyAction).
    //   So here we are setting correct focus.
    //   * document.activeElement in MaterialMenu's handleEnter(): ul
    //   * document.activeElement in Menu's componentDidUpdate(): body (sic!)
    //   * document.activeElement in Menu's keyDownHandler(): MuiPaper (Popover)
    // NOTE: domready required because element doesn't exist
    //   until open is true and it's rendered.
    domready(() => {
      const menuListElem = document.querySelector('#menu ul > li');
      const popup = this.props.ui.popup;
      const open = popup.visibility && (popup.kind === MENU);

      if (open && menuListElem) {
        menuListElem.focus();
      }
    });
  }

  keyDownHandler = (evt) => {
    // Prevents firing body's keyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const action = findKeyAction(evt, [
      {
        key: 'Escape',
        action: () => {
          this.props.actions.closePopup();
        },
      },
      {
        // Passing arrow keys to material-ui, processing all other.
        condition: (evt) => !['ArrowDown', 'ArrowUp', 'Enter', ' ', /* for dev */ 'Shift'].includes(evt.key),
        action: () => {
          this.props.actions.closePopup();
        },
      },
    ]);

    if (action) {
      action();
    }
  }

  runAction = (item) => {
    return () => {
      rippleButtonAction(item.action)();

      // NOTE: if we place closePopup() before rippleButtonAction(),
      //   ripple animation will have no time to take place.
      // If we closePopup() regardless of whether action
      //   opens new popup or not, secondary popup will disappear.
      if (!item.opensAnotherPopup) {
        this.props.actions.closePopup();
      }
    }
  }

  render() {
    const {
      actions,
      ui,
    } = this.props;
    const popup = ui.popup;
    const open = popup.visibility && (popup.kind === MENU);

    const cellPopupAnchorSelector =
      `[data-component-name="${CELL}"]` +
      `[data-row-index="${popup.cellProps[ROW].index}"]` +
      `[data-column-index="${popup.cellProps[COLUMN].index}"]`;

    let popupAnchorSelector;
    let menuItems = [];
    switch (popup.place) {
      case CELL: {
        popupAnchorSelector = cellPopupAnchorSelector;
        menuItems = cellMenuItems(this.props);

        break;
      }

      case CELL_AREA: {
        popupAnchorSelector = cellPopupAnchorSelector;
        menuItems = cellAreaMenuItems(this.props);

        break;
      }

      case LINE_HEADER: {
        let lineType;
        if (popup.cellProps[ROW].index >= 0) {
          lineType = ROW;
        }
        if (popup.cellProps[COLUMN].index >= 0) {
          lineType = COLUMN;
        }

        // test_2340
        // setPopupPlace could go before setPopupCellProps, causing errors.
        if (!lineType) {
          break;
        }

        const index = popup.cellProps[lineType].index;

        let indexSelector;
        if (lineType === ROW) {
          indexSelector = `[data-row-index="${index}"]`;
        } else if (lineType === COLUMN) {
          indexSelector = `[data-column-index="${index}"]`;
        }
        const componentNameSelector = `[data-component-name="${LINE_HEADER}"]`;
        popupAnchorSelector = `${indexSelector}${componentNameSelector}`;
        menuItems = lineHeaderMenuItems(this.props);

        break;
      }

      case GRID_HEADER: {
        popupAnchorSelector = `[data-component-name="${GRID_HEADER}"]`;
        menuItems = gridMenuItems(this.props);

        break;
      }

      default:
    }

    return (
      <Popup
        id="menu"
        kind={MENU}
        offsetX={popup.cellProps[COLUMN].offset}
        offsetY={popup.cellProps[ROW].offset}
        onClose={actions.closePopup}
        onKeyDown={this.keyDownHandler}
        open={open}
        PopoverComponent={MaterialMenu}
        popupAnchorSelector={popupAnchorSelector}
      >
        {menuItems.map((item) =>
          <MenuItem
            dense={true}
            disabled={item.disabled && item.disabled(this.props)}
            key={`menu-item-${item.label}`}
            onClick={this.runAction(item)}
          >
            {item.label}
          </MenuItem>
        )}
      </Popup>
    );
  }
}

Menu.propTypes = propTypes;

export default Menu;

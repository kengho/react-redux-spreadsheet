import React from 'react';
import PropTypes from 'prop-types';

import MenuItem from './MenuItem';

const propTypes = {
  buttonIcon: PropTypes.string,
  buttonId: PropTypes.string.isRequired,
  menuItems: PropTypes.array.isRequired,
  hideOnMouseLeave: PropTypes.bool,
};

const defaultProps = {
  hideOnMouseLeave: true,
  buttonIcon: '',
};

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.cellActionsMenuOnMouseLeaveHandler = (e) => {
      // Event may be fired at all of '.menu' children.
      // REVIEW: is there are way to prevent firing 'onMouseLeave' at for childen?
      //   (Excluding quering 'document' directly.)
      let container;
      // container = document.querySelector(`[id='${props.buttonId}'] + .mdl-menu__container`);
      switch (e.target.tagName) {
        case 'DIV':
          container = e.target.querySelector('.mdl-menu__container');
          break;
        case 'BUTTON':
          container = e.target.parentNode.querySelector('.mdl-menu__container');
          break;
        case 'I':
          container = e.target.parentNode.parentNode.querySelector('.mdl-menu__container');
          break;
        case 'UL':
          container = e.target.parentNode;
          break;
        case 'LI':
          container = e.target.parentNode.parentNode;
          break;
        default:
      }

      // 'is-visible' class applies to '.mdl-menu__container', parent of '.mdl-menu'.
      // ('MaterialMenu.toggle()' causes bugs when user click on list item
      // and moves mouse fast after that.)
      if (container) {
        container.classList.remove('is-visible');
      }
    };

    this.menu = null;
  }

  componentDidMount() {
    componentHandler.upgradeElement(this.menu); // eslint-disable-line no-undef
  }

  render() {
    const { buttonIcon, buttonId, menuItems, hideOnMouseLeave } = this.props;

    // TODO: ArrowDown and ArrowDown, Enter, Escape to navigate through menu.
    const currentMenuItems = [];
    menuItems.forEach((item) => {
      currentMenuItems.push(
        <MenuItem
          key={`menu-button-${buttonId}-${item.label}`}
          action={item.action}
          icon={item.icon}
          label={item.label}
          confirm={item.confirm}
        />
      );
    });

    return (
      <div
        className="menu"
        onMouseLeave={hideOnMouseLeave && ((e) => this.cellActionsMenuOnMouseLeaveHandler(e))}
      >
        <button
          id={buttonId}
          className="mdl-button mdl-js-button mdl-button--icon"
          onClick={
            () => {
              setTimeout(() => {
                // REVIEW: this should be placed somewhere after this line:
                //   https://github.com/google/material-design-lite/blob/
                //   fd21836fd49d94270e58b252187ebe93410209e4/src/menu/menu.js#L404
                //   But I didn't find better way to do so because of it's delays
                //   (excluding overriding entire MaterialMenu.prototype.show).
                //   Here we wait until animation stops and the focusing on first menu item.
                // TODO: focus on '0th' menu item somehow, so ArrowDown goes to 1st.
                this.menu.querySelector('li').focus();
              }, 100);
            }
          }
        >
          <i className="material-icons md-18">{buttonIcon}</i>
        </button>

        { /* blur unfocuses previously focused menu item when user uses mouse. */ }
        <ul
          className="mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect"
          htmlFor={buttonId}
          ref={(c) => { this.menu = c; }}
          onMouseOver={(e) => { e.target.blur(); }}
        >
          {currentMenuItems}
        </ul>
      </div>
    );
  }
}

Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;

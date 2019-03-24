import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  className: PropTypes.string,
  kind: PropTypes.string.isRequired,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  open: PropTypes.bool,
  overrideShouldComponentUpdate: PropTypes.bool,
  PopoverComponent: PropTypes.func.isRequired,
  popupAnchorSelector: PropTypes.string,
};

const defaultProps = {
  className: '',
  offsetX: 0,
  offsetY: 0,
  onKeyDown: () => {},
  open: false,
  overrideShouldComponentUpdate: false,
  popupAnchorSelector: null,
};

class Popup extends React.Component {
  // (?) TODO: PERF: reuse this code in lower components instead (so they won't rerender).
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.overrideShouldComponentUpdate) {
      return true;
    }

    return (nextProps.open !== this.props.open);
  }

  render() {
    const {
      actions,
      children,
      kind,
      offsetX,
      offsetY,
      overrideShouldComponentUpdate, // just not to pass higher
      PopoverComponent, // should be inherited from MUI Popover
      popup,
      popupAnchorSelector,
      ...other
    } = this.props;

    const anchorEl = document.querySelector(popupAnchorSelector);

    let relativeOffsetX = 0;
    let relativeOffsetY = 0;
    if (anchorEl && offsetX !== 0 && offsetY !== 0) {
      const boundingRect = anchorEl.getBoundingClientRect();
      const bottom = boundingRect.bottom;
      const right = boundingRect.right;
      relativeOffsetY = offsetY - bottom - window.scrollY;
      relativeOffsetX = offsetX - right - window.scrollX;
    }

    return (
      <PopoverComponent
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        getContentAnchorEl={null}
        transformOrigin={{ vertical: -relativeOffsetY, horizontal: -relativeOffsetX }}
        {...other}
      >
        {children}
      </PopoverComponent>
    );
  }
}

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;

export default Popup;

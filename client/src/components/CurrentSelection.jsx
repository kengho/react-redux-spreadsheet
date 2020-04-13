import PropTypes from 'prop-types';
import React from 'react';

import './CurrentSelection.css'
import { getSelectionBoundary } from '../core';
import {
  COLUMN,
  ROW,
  BEGIN,
  END,
} from '../constants';

const propTypes = {
  currentSelection: PropTypes.object.isRequired,
  headerHeight: PropTypes.number,
};

const defaultProps = {
  headerHeight: 0,
};

class CurrentSelection extends React.PureComponent {
  render() {
    const {
      currentSelection,
      headerHeight,
    } = this.props;

    if (!currentSelection.visibility) {
      return <div />;
    } else {
      const boundary = getSelectionBoundary(currentSelection);
      if (
        (boundary[ROW][BEGIN].index === boundary[ROW][END].index) &&
        (boundary[COLUMN][BEGIN].index === boundary[COLUMN][END].index)
      ) {
        return <div />;
      }

      let top = boundary[ROW][BEGIN].offset;
      const bottom = boundary[ROW][END].offset + boundary[ROW][END].size;
      const height = bottom - top;
      top += headerHeight;

      const left = boundary[COLUMN][BEGIN].offset;
      const right = boundary[COLUMN][END].offset + boundary[COLUMN][END].size;
      const width = right - left;

      // NOTE: classes defined in Cell.css.
      return (
        <div
          className="selection-top selection-right selection-bottom selection-left"
          id="current-selection"
          style={{
            pointerEvents: 'none', // so it don't messes with cellClickHandler()
            position: 'absolute',
            top,
            left,
            height,
            width,
            zIndex: 800,
          }}
        />
      );
    }
  }
}

CurrentSelection.propTypes = propTypes;
CurrentSelection.defaultProps = defaultProps;

export default CurrentSelection;

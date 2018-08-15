import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import React from 'react';

import './LineSizer.css'
import {
  COLUMN,
  ROW,
} from '../../constants';

const propTypes = {
  actions: PropTypes.object.isRequired,
  columnsHeaderHeight: PropTypes.number,
  columnWidth: PropTypes.number,
  index: PropTypes.number.isRequired,
  lineType: PropTypes.string.isRequired,
  rowHeight: PropTypes.number,
  rowsHeaderWidth: PropTypes.number,
};

const defaultProps = {
  columnsHeaderHeight: 0,
  columnWidth: 0,
  rowHeight: 0,
  rowsHeaderWidth: 0,
};

class LineSizer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      helperVisibility: false,
    };
  }

  render() {
    const {
      actions,
      columnsHeaderHeight,
      columnWidth,
      index,
      lineType,
      rowHeight,
      rowsHeaderWidth,
    } = this.props;

    const HANDLE_SIZE = 8;
    const HELPER_WIDTH = 3;

    // TODO: get from state (default cells' sizes).
    const MIN_COLIMN_WIDTH = 60;
    const MIN_ROW_HEIGHT = 40;
    const HELPER_BORDER = `${HELPER_WIDTH}px dashed #777`;

    let onStopHandler;
    let handleStyle;
    let helperStyle;
    if (lineType === ROW) {
      onStopHandler = (data) => {
        const nextRowHeight = rowHeight + data.lastY;
        const nextLineProps = { lineType: ROW, index, size: nextRowHeight };
        actions.insertLines(nextLineProps);
        actions.setLineSize(nextLineProps);
      };
      handleStyle = {
        bottom: `-7px`,
        cursor: 'row-resize',
        height: `${HANDLE_SIZE}px`,
        width: '100%',
      };
      helperStyle = {
        borderTop: HELPER_BORDER,
        height: '3px',
        left: rowsHeaderWidth,
        width: '100vw',
      };
    } else if (lineType === COLUMN) {
      onStopHandler = (data) => {
        const nextColumnWidth = columnWidth + data.lastX;
        const nextLineProps = { lineType: COLUMN, index, size: nextColumnWidth };
        actions.insertLines(nextLineProps);
        actions.setLineSize(nextLineProps);
      };
      handleStyle = {
        cursor: 'col-resize',
        height: '100%',
        minWidth: `${HANDLE_SIZE}px`,
        right: `-4px`,
        top: 0,
      };
      helperStyle = {
        borderRight: HELPER_BORDER,
        height: '100vh',
        top: columnsHeaderHeight,
        width: '3px',
      };
    }

    return (
      <Draggable
        axis={lineType === ROW ? 'y' : 'x'}
        bounds={{
          left: -columnWidth + MIN_COLIMN_WIDTH,
          top: -rowHeight + MIN_ROW_HEIGHT,
        }}
        grid={[10, 5]}
        handle=".line-sizer-handle"
        onStart={(evt, data) => this.setState({ helperVisibility: true }) }
        onStop={(evt, data) => {
          this.setState({ helperVisibility: false });
          onStopHandler(data);

          // NOTE: onStop should return false in ordet to prevent
          //   "Warning: Can't call setState (or forceUpdate) on an unmounted component." error in firefox.
          //   Code: https://github.com/mzabriskie/react-draggable/blob/1043b9973ead7d7f70314634dcfcb49f9ec510ba/lib/Draggable.js#L283
          // REVIEW: or we shouldn't do it? Works fine for now.
          return false;
        }}
        position={null}
      >
        <div
          className="line-sizer-handle"
          style={handleStyle}
        >
          <div
            className="line-sizer-helper"
            style={{
              ...helperStyle,
              visibility: this.state.helperVisibility ? 'visible' : 'hidden',
            }}
          />
        </div>
      </Draggable>
    );
  }
}

LineSizer.propTypes = propTypes;
LineSizer.defaultProps = defaultProps;

export default LineSizer;

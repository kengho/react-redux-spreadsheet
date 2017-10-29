import domready from 'domready';
import elementResizeDetectorMaker from 'element-resize-detector';
import PropTypes from 'prop-types';
import React from 'react';

import './Cell.css';
import Address from './Address';
import CellHistory from './CellHistory';
import CellMenu from './CellMenu';
import complementsStaticData from './complementsStaticData';
import cssToNumber from '../lib/cssToNumber';
import Data from './Data';
import LineMenu from './LineMenu';
import numberToCss from '../lib/numberToCss';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  columnNumber: PropTypes.number.isRequired,
  currentUi: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]).isRequired,
  history: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  historySize: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
  ]),
  historyVisibility: PropTypes.bool,
  isColumnHover: PropTypes.bool.isRequired,
  isColumnOnly: PropTypes.bool.isRequired,
  isRowOnly: PropTypes.bool.isRequired,
  nextColumnMenuCellId: PropTypes.string,
  nextColumnMenuPlace: PropTypes.string,
  nextRowMenuCellId: PropTypes.string,
  nextRowMenuPlace: PropTypes.string,
  previousColumnMenuCellId: PropTypes.string,
  previousColumnMenuPlace: PropTypes.string,
  previousRowMenuCellId: PropTypes.string,
  previousRowMenuPlace: PropTypes.string,
  rowNumber: PropTypes.number.isRequired,
  value: PropTypes.string,
};

const defaultProps = {
  historyVisibility: false,
  history: false,
  historySize: false,

  // Prop doesn't used in Cell, but used later. Defaulting it once here.
  value: '',
};

class Cell extends React.PureComponent {
  constructor(props) {
    super(props);

    this.alignComplements = this.alignComplements.bind(this);

    // 'refs' word if reserved by React.
    this.domRefs = {
      'ROW': {},
      'COLUMN': {},
      'CELL': undefined,
    };
  }

  componentDidMount() {
    // TODO: w/o domready() getBoundingClientRect() in
    //   alignComplements() returns wrong results.
    //   Figure out why, get rid of domready().
    domready(() => {
      this.alignComplements();

      const cellRef = this.domRefs['CELL'];
      if (cellRef) {
        const erd = elementResizeDetectorMaker({ strategy: 'scroll' });
        erd.listenTo(cellRef, () => this.alignComplements() );
      }
    });
  }

  componentDidUpdate() {
    domready(() => {
      this.alignComplements();
    })
  }

  alignComplements() {
    if (this.props.columnNumber !== 0 && this.props.rowNumber !== 0) {
      return;
    }

    const cellRef = this.domRefs['CELL'];

    if (!cellRef) {
      return;
    }

    Object.keys(complementsStaticData.lines).forEach((lineRef) => {
      let complementShift = 0;

      complementsStaticData.order.forEach((complementName) => {
        const complementStaticData = complementsStaticData.lines[lineRef][complementName];
        const complementRef = this.domRefs[lineRef][complementName];

        if (complementRef) {
          const complementHeightNumber = cssToNumber(complementStaticData.style.height);
          const complementWidthNumber = cssToNumber(complementStaticData.style.width);

          // REVIEW: is it possible to DRY code preserving semantics?
          //   I could just run this code twice and swap width/height
          //   and top/left the second time, but it would look meaningless IMO.
          if (lineRef === 'ROW') {
            const cellCenterY = cellRef.getBoundingClientRect().height / 2;
            complementRef.style.top = numberToCss(cellCenterY - complementHeightNumber / 2);
            complementRef.style.left = numberToCss(-(complementWidthNumber + complementShift));
            complementShift += complementWidthNumber;
          } else if (lineRef === 'COLUMN') {
            const cellCenterX = cellRef.getBoundingClientRect().width / 2;
            complementRef.style.left = numberToCss(cellCenterX - complementWidthNumber / 2);
            complementRef.style.top = numberToCss(-(complementHeightNumber + complementShift));
            complementShift += complementHeightNumber;
          }
        }
      });
    });
  }

  render() {
    // Extracting props.
    const {
      columnNumber,
      historySize,
      historyVisibility,
      isColumnHover,
      isColumnOnly,
      isRowOnly,
      nextColumnMenuCellId,
      nextColumnMenuPlace,
      nextRowMenuCellId,
      nextRowMenuPlace,
      previousColumnMenuCellId,
      previousColumnMenuPlace,
      previousRowMenuCellId,
      previousRowMenuPlace,
      rowNumber,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // uses in Data, LineMenu and CellHistory
      history, // uses in CellHistory
    } = this.props;

    let complements = [];

    // TODO: replace lineRef to place everywhere (or vice versa).
    ['ROW', 'COLUMN'].forEach((lineRef) => {
      let lineNumber;
      if (lineRef === 'COLUMN' && rowNumber === 0) {
        lineNumber = columnNumber;
      }
      if (lineRef === 'ROW' && columnNumber === 0) {
        lineNumber = rowNumber;
      }

      if (typeof lineNumber === 'number') {
        let isLineHover;
        let isLineOnly;
        let nextMenuCellId;
        let nextMenuPlace;
        let previousMenuCellId;
        let previousMenuPlace;
        if (lineRef === 'COLUMN') {
          isLineHover = isColumnHover;
          isLineOnly = isColumnOnly;
          nextMenuCellId = nextColumnMenuCellId;
          nextMenuPlace = nextColumnMenuPlace;
          previousMenuCellId = previousColumnMenuCellId;
          previousMenuPlace = previousColumnMenuPlace;
        }
        if (lineRef === 'ROW') {
          isLineOnly = isRowOnly;
          nextMenuCellId = nextRowMenuCellId;
          nextMenuPlace = nextRowMenuPlace;
          previousMenuCellId = previousRowMenuCellId;
          previousMenuPlace = previousRowMenuPlace;
        }

        const complementClassname = `complement ${lineRef.toLowerCase()}`;

        complements.push(
          <div key={`${this.props.cellId}-complement-${lineRef.toLowerCase()}`}>
            <div
              style={complementsStaticData.lines[lineRef]['MENU'].style}
              className={complementClassname}
              ref={(c) => { this.domRefs[lineRef]['MENU'] = c; }}
            >
              <LineMenu
                {...other}
                isLineHover={isLineHover}
                isLineOnly={isLineOnly}
                lineNumber={lineNumber}
                place={lineRef}
                nextMenuCellId={nextMenuCellId}
                nextMenuPlace={nextMenuPlace}
                previousMenuCellId={previousMenuCellId}
                previousMenuPlace={previousMenuPlace}
              />
            </div>
            <div
              style={complementsStaticData.lines[lineRef]['ADDRESS'].style}
              className={complementClassname}
              ref={(c) => { this.domRefs[lineRef]['ADDRESS'] = c; }}
            >
              <Address
                lineNumber={lineNumber}
                lineRef={lineRef}
              />
            </div>
          </div>
        );
      }
    });

    return (
      <div
        className="td"
        onMouseOver={() => { actions.tableSetHover(this.props.cellId); } }
        ref={(c) => { this.domRefs['CELL'] = c; }}
      >
        {complements}
        <Data
          {...other}
        />
        <CellMenu
          {...other}
          historyVisibility={historyVisibility}
          isHistoryAvailable={historySize > 0}
        />
        {historyVisibility && history &&
          <CellHistory
            {...other}
          />
        }
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export default Cell;

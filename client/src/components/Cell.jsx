import domready from 'domready';
import elementResizeDetectorMaker from 'element-resize-detector';
import PropTypes from 'prop-types';
import React from 'react';

import Address from './Address';
import complementsStaticData from './complementsStaticData';
import cssToNumber from '../lib/cssToNumber';
import Data from './Data';
import LineMenu from './LineMenu';
import numberToCss from '../lib/numberToCss';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  columnMenuVisibility: PropTypes.bool,
  columnNumber: PropTypes.number.isRequired,
  isColumnHover: PropTypes.bool.isRequired,
  isColumnOnly: PropTypes.bool.isRequired,
  isRowOnly: PropTypes.bool.isRequired,
  nextColumnMenuId: PropTypes.string,
  nextRowMenuId: PropTypes.string,
  previousColumnMenuId: PropTypes.string,
  previousRowMenuId: PropTypes.string,
  rowMenuVisibility: PropTypes.bool,
  rowNumber: PropTypes.number.isRequired,
};

const defaultProps = {
  columnMenuVisibility: false,
  rowMenuVisibility: false,
};

class Cell extends React.PureComponent {
  constructor(props) {
    super(props);

    this.alignComplements = this.alignComplements.bind(this);

    // refs if reserved by React.
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
        const erd = elementResizeDetectorMaker({ strategy: "scroll" });
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
    const cellRef = this.domRefs['CELL'];

    // REVIEW: should we use guard clauses here and everywhere?
    if (cellRef) {
      Object.keys(complementsStaticData.lines).forEach((lineRef) => {
        let complementShift = 0;

        complementsStaticData.order.forEach((complementName) => {
          const complementStaticData = complementsStaticData.lines[lineRef][complementName];
          const complementRef = this.domRefs[lineRef][complementName];

          if (complementRef) {
            const complementHeightNumber = cssToNumber(complementStaticData.style.height);
            const complementWidthNumber = cssToNumber(complementStaticData.style.width);

            // REVIEW: is it possible to DRY code with semantics?
            //   I could just run thic code twice and swap width/height
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
  }

  render() {
    const {
      actions, // uses in Cell, Data and LineMenu
      cellId, // uses in Cell and Data
      columnMenuVisibility,
      columnNumber,
      isColumnHover,
      isColumnOnly,
      isRowOnly,
      nextColumnMenuId,
      nextRowMenuId,
      previousColumnMenuId,
      previousRowMenuId,
      rowMenuVisibility,
      rowNumber,
      ...other,
    } = this.props;

    let complements = [];
    ['ROW', 'COLUMN'].forEach((lineRef) => {
      let isHover;
      let isOnly;
      let lineNumber;
      let menuVisibility;
      let nextMenuId;
      let previousMenuId;
      if (lineRef === 'COLUMN' && rowNumber === 0) {
        isHover = isColumnHover;
        isOnly = isColumnOnly;
        lineNumber = columnNumber;
        menuVisibility = columnMenuVisibility;
        nextMenuId = nextColumnMenuId;
        previousMenuId = previousColumnMenuId;
      }
      if (lineRef === 'ROW' && columnNumber === 0) {
        isOnly = isRowOnly;
        lineNumber = rowNumber;
        menuVisibility = rowMenuVisibility;
        nextMenuId = nextRowMenuId;
        previousMenuId = previousRowMenuId;
      }

      const complementClassname = `complement ${lineRef.toLowerCase()}`;
      const menuId = `${cellId}-${lineRef.toLowerCase()}`;

      if (lineNumber >= 0) {
        complements.push(
          <div key={`${cellId}-complement-${lineRef.toLowerCase()}`}>
            <div
              style={complementsStaticData.lines[lineRef]['MENU'].style}
              className={complementClassname}
              ref={(c) => { this.domRefs[lineRef]['MENU'] = c; }}
            >
              <LineMenu
                {...other}
                actions={actions}
                isHover={isHover}
                isOnly={isOnly}
                lineNumber={lineNumber}
                lineRef={lineRef}
                menuId={menuId}
                menuVisibility={menuVisibility}
                nextMenuId={nextMenuId}
                previousMenuId={previousMenuId}
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
        onMouseOver={() => { actions.tableSetHover(cellId); } }
        ref={(c) => { this.domRefs['CELL'] = c; }}
      >
        {complements}
        <Data
          {...other}
          actions={actions}
          cellId={cellId}
        />
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export default Cell;

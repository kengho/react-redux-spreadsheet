import domready from 'domready';
import elementResizeDetectorMaker from 'element-resize-detector';
import PropTypes from 'prop-types';
import React from 'react';

import Address from './Address';
import cssToNumber from '../lib/cssToNumber';
import Data from './Data';
import LineMenu from './LineMenu';
import numberToCss from '../lib/numberToCss';

// TODO: rows and columns uses only for isHover and isOnly,
//   this props could me passed by DataRow,
//   DataCell and other children will be pure.
//   The same is for menu.
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

    const defaultComplementPosition = {
      top: '-9999px',
      left: '-9999px',
    };

    // Complements are something to be drawn along with cell.
    // NOTE: This object could be derived just from its ROW part,
    //   but it would look to complicated, also should be calculated for each cell.
    //   Code for this transformation may be found below.
    // TODO: move it somewhere, import here.
    this.complements = {
      lines: {
        'ROW': {
          'ADDRESS': {
            style: {
              width: '32px',
              height: '64px',
              ...defaultComplementPosition,
            },
            ref: undefined,
          },
          'MENU': {
            style: {
              width: '48px',
              height: '64px',
              ...defaultComplementPosition,
            },
            ref: undefined,
          },
        },
        'COLUMN': {
          'ADDRESS': {
            // Values are just reverse of that for ROW.
            style: {
              width: '64px',
              height: '32px',
              ...defaultComplementPosition,
            },
            ref: undefined,
          },
          'MENU': {
            style: {
              width: '64px',
              height: '48px',
              ...defaultComplementPosition,
            },
            ref: undefined,
          },
        },
      },
      order: ['ADDRESS', 'MENU'],
    };

    // const getStyle = (styleNum) => {
    //   const style = { ...styleNum };
    //   Object.keys(style).forEach((prop) => {
    //     if (['width', 'height'].indexOf(prop) != -1) {
    //       style[prop] = `${styleNum[prop]}px`;
    //     }
    //
    //     // Default position, will be adjusted later in alignComplements().
    //     style.top = '-9999px';
    //     style.left = '-9999px';
    //   });
    //
    //   return style;
    // };
    //
    // Add ROW using deep clone of COLUMN.
    // https://stackoverflow.com/a/5344074/6376451
    // this.complements.lines['ROW'] = JSON.parse(JSON.stringify(this.complements.lines['COLUMN']));
    //
    // // Prepare complements object.
    // // There are up to 4 complements because of [0, 0] cell which have them all.
    // Object.keys(this.complements.lines).forEach((lineRef) => {
    //   this.complements.order.forEach((complementName) => {
    //     const complement = this.complements.lines[lineRef][complementName];
    //
    //     // Swap width and height for ROW.
    //     if (lineRef === 'ROW') {
    //       const styleNum = complement.styleNum;
    //
    //       let tmp = styleNum.width;
    //       styleNum.width = styleNum.height;
    //       styleNum.height = tmp;
    //     }
    //
    //     // Apply getStyle().
    //     complement.style = getStyle(complement.styleNum);
    //   });
    // });
  }

  componentDidMount() {
    // NOTE: w/o domready() getBoundingClientRect() in
    //   alignComplements() returns wrong results,
    //   probably because of bad-sized textarea
    //   (it is wider that it should be).
    //   Should get rid of domready() after fixing it.
    domready(() => {
      this.alignComplements();

      if (this.cellRef) {
        const erd = elementResizeDetectorMaker({ strategy: "scroll" });
        erd.listenTo(this.cellRef, () => this.alignComplements() );
      }
    });
  }

  componentDidUpdate() {
    this.alignComplements();
  }

  alignComplements() {
    // REVIEW: should we use guard clauses here and everywhere?
    if (this.cellRef) {
      Object.keys(this.complements.lines).forEach((lineRef) => {
        let complementShift = 0;

        this.complements.order.forEach((complementName) => {
          const complement = this.complements.lines[lineRef][complementName];

          if (complement.ref) {
            const complementHeightNumber = cssToNumber(complement.style.height);
            const complementWidthNumber = cssToNumber(complement.style.width);

            // REVIEW: is it possible to DRY code with semantics?
            //   I could just run thic code twice and swap width/height
            //   and top/left the second time, but it would look meaningless IMO.
            if (lineRef === 'ROW') {
              const cellCenterY = this.cellRef.getBoundingClientRect().height / 2;
              complement.ref.style.top = numberToCss(cellCenterY - complementHeightNumber / 2);
              complement.ref.style.left = numberToCss(-(complementWidthNumber + complementShift));
              complementShift += complementWidthNumber;
            } else if (lineRef === 'COLUMN') {
              const cellCenterX = this.cellRef.getBoundingClientRect().width / 2;
              complement.ref.style.left = numberToCss(cellCenterX - complementWidthNumber / 2);
              complement.ref.style.top = numberToCss(-(complementHeightNumber + complementShift));
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
        previousMenuId = previousColumnMenuId;
        nextMenuId = nextColumnMenuId;
      }
      if (lineRef === 'ROW' && columnNumber === 0) {
        lineNumber = rowNumber;
        isOnly = isRowOnly;
        menuVisibility = rowMenuVisibility;
        previousMenuId = previousRowMenuId;
        nextMenuId = nextRowMenuId;
      }

      const addressComplement = this.complements.lines[lineRef]['ADDRESS'];
      const menuComplement = this.complements.lines[lineRef]['MENU'];
      const complementClassname = `complement ${lineRef.toLowerCase()}`;
      const menuId = `${cellId}-${lineRef.toLowerCase()}`;

      if (lineNumber >= 0) {
        complements.push(
          <div key={`${cellId}-complement-${lineRef.toLowerCase()}`}>
            <div
              style={menuComplement.style}
              className={complementClassname}
              ref={(c) => { menuComplement.ref = c; }}
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
              style={addressComplement.style}
              className={complementClassname}
              ref={(c) => { addressComplement.ref = c; }}
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
        ref={(c) => { this.cellRef = c; }}
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

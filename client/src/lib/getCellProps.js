// TODO: REVIEW: probably not everying here is needed since we don't
//   have this.pointedCell in Table and using EditingCell instead.

import { ROW, COLUMN } from '../constants';

export function getCellSize(cell) {
  if (!cell) {
    return;
  }

  const boundingRect = cell.getBoundingClientRect();
  const height = boundingRect.height;
  const width = boundingRect.width;

  return {
    [ROW]: {
      size: height,
    },
    [COLUMN]: {
      size: width,
    },
  };
};

export function getCellOffsets(cell) {
  if (!cell) {
    return;
  }

  const cellRect = cell.getBoundingClientRect();
  const cellTop = cellRect.top;
  const cellLeft = cellRect.left;

  const bodyRect = document.body.getBoundingClientRect();
  const bodyTop = bodyRect.top;
  const bodyLeft = bodyRect.left;

  return {
    [ROW]: {
      offset: cellTop - bodyTop,
    },
    [COLUMN]: {
      offset: cellLeft - bodyLeft,
    },
  };
};

export function getCellPosition({ evt, elem, allowPartial = false }) {
  if (!evt && !elem) {
    return;
  }

  let target;
  if (evt) {
    target = evt.target;
  } else if (elem) {
    target = elem;
  }
  if (!target) {
    return;
  }

  let {
    rowIndex,
    columnIndex,
  } = target.dataset;
  if (allowPartial) {
    if (rowIndex === undefined && columnIndex === undefined) {
      return;
    }
  } else {
    if (rowIndex === undefined || columnIndex === undefined) {
      return;
    }
  }

  rowIndex = parseInt(rowIndex, 10);
  columnIndex = parseInt(columnIndex, 10);
  if (allowPartial) {
    if (isNaN(rowIndex) && isNaN(columnIndex)) {
      return;
    }
  } else {
    if (isNaN(rowIndex) || isNaN(columnIndex)) {
      return;
    }
  }

  return {
    [ROW]: {
      index: rowIndex,
    },
    [COLUMN]: {
      index: columnIndex,
    },
  };
}

export function getCellValue(cell) {
  if (!cell) {
    return;
  }

  if (cell.innerText === '\n') {
    cell.innerText = '';
  }

  // TODO: SECURITY: find out is letting user to set 'innerText' secure.
  //   On first glance it's OK, at least in modern Firefox and Chrome.
  return cell.innerText;
};

export function composeCellProps(...propContainers) {
  const props = {
    [ROW]: {},
    [COLUMN]: {},
  };

  propContainers.forEach((propContainer) => {
    [ROW, COLUMN].forEach((lineType) => {
      if (propContainer[lineType]) {
        Object.assign(props[lineType], propContainer[lineType]);
      } else {
        Object.assign(props, propContainer);
      }
    });
  });

  return props;
}

export default (cell) => {
  if (!cell) {
    return;
  }

  const cellSize = getCellSize(cell);
  const cellOffsets = getCellOffsets(cell);
  const cellPosition = getCellPosition({ elem: cell });
  const cellValue = getCellValue(cell);

  return composeCellProps(cellSize, cellOffsets, cellPosition, { value: cellValue })
};

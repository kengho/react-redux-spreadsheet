/**
 * calculateNodeSize(uiTextNode, useCache = false)
 */

const HIDDEN_TEXTAREA_STYLE = `
  min-height:0 !important;
  max-height:none !important;
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important
`;

const SIZING_STYLE = [
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'font-family',
  'font-weight',
  'font-size',
  'text-rendering',
  'text-transform',
  'width',
  'text-indent',
  'padding-left',
  'padding-right',
  'border-width',
  'box-sizing'
];

let computedStyleCache = {};
let hiddenTextarea;

export default function calculateNodeSize(uiTextNode,
    useCache = false,
    minRows = null, maxRows = null,
    autosizeWidth = false, minWidth = '0', maxWidth = '1920px', autosizeWidthPrecision = 8) {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea');
    document.body.appendChild(hiddenTextarea);
  }

  hiddenTextarea.fill = (sizingStyle) => {
    hiddenTextarea.setAttribute('style', sizingStyle + ';' + HIDDEN_TEXTAREA_STYLE);
    hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || 'x';
  };

  // Copy all CSS properties that have an impact on the height of the content in
  // the textbox
  let {
    paddingSize, borderSize,
    boxSizing, sizingStyle
  } = calculateNodeStyling(uiTextNode, useCache);

  let width;
  if (autosizeWidth) {
    const getWidthFromCSS = (cssWidth) => {
      if (cssWidth === '0') {
        return 0;
      }

      const match = cssWidth.match(/^(\d+)px$/);
      if (match) {
        return Number(match[1]);
      } else {
        // eslint-disable-next-line no-console
        console.log('Warning: maxWidth and minWidth should be equal to \"0\" or match \"/^(\d+)px$\"/');
      }
    };

    minWidth = getWidthFromCSS(minWidth);
    maxWidth = getWidthFromCSS(maxWidth);

    const calculateNodeWidth = () => {
      const getScrollHeight = (width) => {
        const currentSizingStyle = sizingStyle + `; width: ${width}px;`;
        hiddenTextarea.fill(currentSizingStyle);

        return hiddenTextarea.scrollHeight;
      };

      const initialHigherScrollHeight = getScrollHeight(minWidth);
      const initialLowerScrollHeight = getScrollHeight(maxWidth);
      if (initialHigherScrollHeight === initialLowerScrollHeight) {
        return minWidth;
      }

      const binarySearchMaxWidthMinScrollHeight = (
        lowerBoundary,
        higherBoundary,
        lastLowerScrollHeight,
        lastHigherBoundary
      ) => {
        if (higherBoundary - lowerBoundary < autosizeWidthPrecision) {
          // lastHigherBoundary should be enough, but for some reason it's not.
          return lastHigherBoundary + 10;
        }

        const lowerScrollHeight = getScrollHeight(higherBoundary);

        if (lowerScrollHeight <= lastLowerScrollHeight) {
          return binarySearchMaxWidthMinScrollHeight(
            lowerBoundary,
            lowerBoundary + (higherBoundary - lowerBoundary) / 2,
            lowerScrollHeight,
            higherBoundary,
          );
        } else {
          return binarySearchMaxWidthMinScrollHeight(
            higherBoundary,
            higherBoundary + (higherBoundary - lowerBoundary),
            lastLowerScrollHeight,
            higherBoundary,
          );
        }
      };

      return binarySearchMaxWidthMinScrollHeight(minWidth, maxWidth, Infinity);
    };

    width = calculateNodeWidth();
    sizingStyle += `; width: ${width}px;`;
  }

  // Need to have the overflow attribute to hide the scrollbar otherwise
  // text-lines will not calculated properly as the shadow will technically be
  // narrower for content
  hiddenTextarea.fill(sizingStyle);

  let minHeight = -Infinity;
  let maxHeight = Infinity;

  let height = hiddenTextarea.scrollHeight;

  if (boxSizing === 'border-box') {
    // border-box: add border, since height = content + padding + border
    height = height + borderSize;
  } else if (boxSizing === 'content-box') {
    // remove padding, since height = content
    height = height - paddingSize;
  }

  if (minRows !== null || maxRows !== null) {
    // measure height of a textarea with a single row
    hiddenTextarea.value = 'x';
    let singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;
    if (minRows !== null) {
      minHeight = singleRowHeight * minRows;
      if (boxSizing === 'border-box') {
        minHeight = minHeight + paddingSize + borderSize;
      }
      height = Math.max(minHeight, height);
    }
    if (maxRows !== null) {
      maxHeight = singleRowHeight * maxRows;
      if (boxSizing === 'border-box') {
        maxHeight = maxHeight + paddingSize + borderSize;
      }
      height = Math.min(maxHeight, height);
    }
  }
  return {height, minHeight, maxHeight, width, minWidth, maxWidth};
}

function calculateNodeStyling(node, useCache = false) {
  let nodeRef = (
    node.getAttribute('id') ||
    node.getAttribute('data-reactid') ||
    node.getAttribute('name')
  );

  if (useCache && computedStyleCache[nodeRef]) {
    return computedStyleCache[nodeRef];
  }

  let style = window.getComputedStyle(node);

  let boxSizing = (
    style.getPropertyValue('box-sizing') ||
    style.getPropertyValue('-moz-box-sizing') ||
    style.getPropertyValue('-webkit-box-sizing')
  );

  let paddingSize = (
    parseFloat(style.getPropertyValue('padding-bottom')) +
    parseFloat(style.getPropertyValue('padding-top'))
  );

  let borderSize = (
    parseFloat(style.getPropertyValue('border-bottom-width')) +
    parseFloat(style.getPropertyValue('border-top-width'))
  );

  let sizingStyle = SIZING_STYLE
    .map(name => `${name}:${style.getPropertyValue(name)}`)
    .join(';');

  let nodeInfo = {
    sizingStyle,
    paddingSize,
    borderSize,
    boxSizing
  };

  if (useCache && nodeRef) {
    computedStyleCache[nodeRef] = nodeInfo;
  }

  return nodeInfo;
}

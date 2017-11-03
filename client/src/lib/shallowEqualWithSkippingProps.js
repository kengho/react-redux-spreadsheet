// Modified shallowequal from dashed/shallowequal
// https://github.com/dashed/shallowequal/blob/master/index.js
// with skippingProps param
// (also some redundant for this app checks are skipped).
//
// TODO: test.
const shallowEqualWithSkippingProps = (objA, objB, skippingProps = []) => {
  if (objA === objB) {
    return true;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  // Test for A's keys different from B.
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];

    if (skippingProps.indexOf(key) !== -1) {
      continue;
    }

    if (!bHasOwnProperty(key)) {
      return false;
    }

    var valueA = objA[key];
    var valueB = objB[key];

    if (valueA !== valueB) {
      return false;
    }
  }

  return true;
};

export default shallowEqualWithSkippingProps;

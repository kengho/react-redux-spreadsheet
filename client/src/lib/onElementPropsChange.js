// Modified code from here:
//   https://stackoverflow.com/a/14901150/6376451
export default (elem, props, timeout, callback) => {
  let lastValues = props.map((prop) => elem[prop]);
  let newValues;

  const watchProp = () => {
    newValues = props.map((prop) => elem[prop]);
    newValues.some((newValue, index) => {
      const lastValue = lastValues[index];
      if (lastValue !== newValue) {
        callback(props[index], lastValue, newValue);
        return true;
      } else {
        return false;
      }
    });

    lastValues = newValues;

    if (elem.onElementPropsChangeTimer) {
      clearTimeout(elem.onElementPropsChangeTimer);
    }
    elem.onElementPropsChangeTimer = setTimeout(watchProp, timeout);

    return () => clearTimeout(elem.onElementPropsChangeTimer);
  };

  return watchProp();
};

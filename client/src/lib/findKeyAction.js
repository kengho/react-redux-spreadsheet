const findKeyAction = (evt, options) => {
  const { key, shiftKey, ctrlKey, altKey } = evt;

  const option = options.find((item) => {
    let keyMatch;
    if (item.condition) {
      keyMatch = item.condition();
    } else if (item.keys) {
      keyMatch = (item.keys.indexOf(key) !== -1);
    } else if (item.key) {
      keyMatch = (item.key === evt.key);
    } else if (item.which) {
      keyMatch = (item.which === evt.which);
    } else if (item.whichs) {
      keyMatch = (item.whichs.indexOf(evt.which) !== -1);
    }

    return (
      keyMatch &&
      altKey === (item.altKey || false) &&
      ctrlKey === (item.ctrlKey || false) &&
      shiftKey === (item.shiftKey || false)
    );
  });

  let action;
  if (option) {
    action = option.action;
  } else {
    action = () => {};
  }

  return action;
};

export default findKeyAction;

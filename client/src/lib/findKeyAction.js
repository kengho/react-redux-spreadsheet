const findKeyAction = (evt, options) => {
  const { key, evtAltKey, evtCtrlKey, evtShiftKey } = evt;

  const option = options.find((item) => {
    const { itemAltKey, itemShiftKey, itemCtrlKey } = item;

    let keyMatch;
    if (item.condition) {
      keyMatch = item.condition();
    } else if (item.keys) {
      keyMatch = (item.keys.includes(key));
    } else if (item.key) {
      keyMatch = (item.key === evt.key);
    } else if (item.which) {
      keyMatch = (item.which === evt.which);
    } else if (item.whichs) {
      keyMatch = (item.whichs.includes(evt.which));
    }

    return (
      keyMatch &&
      (evtAltKey || false) === (itemAltKey || false) &&
      (evtCtrlKey || false) === (itemCtrlKey || false) &&
      (evtShiftKey|| false)  === (itemShiftKey || false)
    );
  });

  let action = null;
  if (option) {
    action = option.action;
  }

  return action;
};

export default findKeyAction;

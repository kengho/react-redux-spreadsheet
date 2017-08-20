import React from 'react';
import ReactDOM from 'react-dom';

// Some code is taken from here:
// https://github.com/tb/react-rails-ujs/blob/master/src/react-rails-ujs.js
const mountComponents = (components) => {
  Object.keys(components).forEach((componentName) => {
    const componentRoot = document.querySelector(`[data-react-class="${componentName}"]`); // eslint-disable-line no-undef
    if (!componentRoot) {
      return;
    }

    const component = components[componentName];
    const propsJson = componentRoot.getAttribute('data-react-props');
    const props = propsJson && JSON.parse(propsJson);
    ReactDOM.render(React.createElement(component, props), componentRoot);
  });
};

export default mountComponents;

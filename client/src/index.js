// Based on
// https://github.com/supasate/connected-react-router/blob/master/FAQ.md#how-to-support-immutablejs
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App'
import configureStore from './store/configureStore';
import registerServiceWorker from './registerServiceWorker';

const initialState = {};
const history = createBrowserHistory();
const store = configureStore(initialState, history);

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App history={history}/>
    </Provider>,
    document.getElementById('root')
  );
};

render();
registerServiceWorker();

// For dev.
if (process.env.NODE_ENV !== 'production') {
  const replacer = (key, value) => (typeof value === 'undefined') ? null : value;
  process.log = (x) => console.log(JSON.stringify(x, replacer, 2));
  process.clog = (x) => {
    if (process.logBelow) {
      process.log(x);
    }
  }
}

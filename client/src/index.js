// Based on
// https://github.com/supasate/connected-react-router/blob/master/FAQ.md#how-to-support-immutablejs
import { createBrowserHistory } from 'history';
import { Map } from 'immutable';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { configureStore } from './store/configureStore';
import App from './App'
import registerServiceWorker from './registerServiceWorker';

const initialState = Map();
const history = createBrowserHistory();
const store = configureStore(initialState, history);

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    document.getElementById('root')
  );
};

render();
registerServiceWorker();

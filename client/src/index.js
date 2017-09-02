// Based on
// https://github.com/supasate/connected-react-router/blob/master/FAQ.md#how-to-support-immutablejs
import { Map } from 'immutable';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { configureStore, history } from './store/configureStore';
import App from './App'
import registerServiceWorker from './registerServiceWorker';

const initialState = Map();
const store = configureStore(initialState);

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

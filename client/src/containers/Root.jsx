import { Provider } from 'react-redux';
import React, { Component } from 'react';

import App from './App';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

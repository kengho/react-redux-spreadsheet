import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import SpreadsheetApp from './SpreadsheetApp';
import configureStore from '../store/configureStore';
import { setData } from '../actions/table';
import { setShortId } from '../actions/meta';

const store = configureStore();

const propTypes = {
  data: PropTypes.string.isRequired,
  shortId: PropTypes.string.isRequired,
};

export default class Root extends Component {
  componentWillMount() {
    store.dispatch(setData(JSON.parse(this.props.data)));
    store.dispatch(setShortId(this.props.shortId));
  }

  render() {
    return (
      <Provider store={store}>
        <SpreadsheetApp />
      </Provider>
    );
  }
}

Root.propTypes = propTypes;

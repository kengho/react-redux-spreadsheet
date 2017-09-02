import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route } from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';

import getRootPath from './lib/getRootPath';
import Landing from './containers/Landing';
import Spreadsheet from './containers/Spreadsheet';

const propTypes = {
  history: PropTypes.object.isRequired,
};

const defaultProps = {
};

const App = ({ history }) => {
  const rootPath = getRootPath();

  return (
    <ConnectedRouter history={history}>
      <div>
        <Route exact path={rootPath} component={Landing} />
        <Route exact path={`${rootPath}:shortId`} component={Spreadsheet} />
      </div>
    </ConnectedRouter>
  )
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;

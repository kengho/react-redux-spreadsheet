import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route } from 'react-router';
import GithubMark from 'react-github-mark';
import PropTypes from 'prop-types';
import React from 'react';

import getRootPath from './lib/getRootPath';
import Landing from './containers/Landing';
import Spreadsheet from './containers/Spreadsheet';
import Dialog from './containers/Dialog';

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
        <Dialog />
        <GithubMark
          href="https://github.com/kengho/react-redux-spreadsheet"
          position="bottom-right"
        />
      </div>
    </ConnectedRouter>
  )
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
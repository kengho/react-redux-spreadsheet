import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route, Switch } from 'react-router';
import GithubMark from 'react-github-mark';
import PropTypes from 'prop-types';
import React from 'react';

import './App.css';
import Dialog from './containers/Dialog/Dialog';
import ErrorPageNotFound from './containers/ErrorPageNotFound';
import getRootPath from './lib/getRootPath';
import Landing from './containers/Landing';
import Spreadsheet from './containers/Spreadsheet';

const propTypes = {
  history: PropTypes.object.isRequired,
};

const App = ({ history }) => {
  const rootPath = getRootPath();

  return (
    <div>
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path={rootPath} component={Landing} />
          <Route exact path={`${rootPath}:shortId`} component={Spreadsheet} />
          <Route component={ErrorPageNotFound}/>
        </Switch>
      </ConnectedRouter>
      <Dialog />
      <GithubMark
        href="https://github.com/kengho/react-redux-spreadsheet"
        position="bottom-right"
      />
    </div>
  );
}

App.propTypes = propTypes;

export default App;

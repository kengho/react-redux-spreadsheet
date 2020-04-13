import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import React from 'react';

import './Landing.css';
import { OFFLINE } from '../constants';
import * as ServerActions from '../actions/server';
import * as TableActions from '../actions/table';
import getRootPath from '../lib/getRootPath';
import SpreadsheetCreator from '../components/SpreadsheetCreator';
import withCircularProgress from '../components/withCircularProgress';

const mapStateToProps = (state) => ({
  errors: state.server.errors,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...ServerActions,
      ...TableActions,
    }, dispatch),
  },
});

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonIsDisabled: false,
    };
  }

  render() {
    const {
      actions,
      errors,
      history,
    } = this.props;

    const buttonIsDisabled = this.state.buttonIsDisabled;

    return (
      <div id="landing">
        <SpreadsheetCreator
          beforeRecaptchaExecute={() => this.setState({ buttonIsDisabled: true })}
          history={history}
          onErrors={(errors) => {
            actions.setErrors(errors);
            this.setState({ buttonIsDisabled: false });
          }}
          onRecaptchaLoaded={() => this.setState({ buttonIsDisabled: false })}
          onRecaptchaResolved={() => this.setState({ buttonIsDisabled: false })}
          openInNewTab={false}
          recaptchaSitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        >
          {withCircularProgress(
            <Button
              color="primary"
              disabled={buttonIsDisabled}
              raised="true"
              variant="contained"
            >
              create spreadsheet
            </Button>,
            buttonIsDisabled
          )}
        </SpreadsheetCreator>
        <Button
          dense="true"
          onClick={() => history.push(`${getRootPath()}${OFFLINE.toLowerCase()}`)}
        >
          try offline
        </Button>
        <div id="errors">
          <ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

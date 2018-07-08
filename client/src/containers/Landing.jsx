import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import Button from 'material-ui/Button';
import React from 'react';

import './Landing.css';
import { OFFLINE } from '../constants';
import * as LandingActions from '../actions/landing';
import * as TableActions from '../actions/table';
import getRootPath from '../lib/getRootPath';
import SpreadsheetCreator from '../components/SpreadsheetCreator';
import withCircularProgress from '../components/withCircularProgress';

const mapStateToProps = (state) => ({
  buttonIsDisabled: state.getIn(['landing', 'buttonIsDisabled']),
  messages: state.getIn(['landing', 'messages']) || fromJS([]), // default value for tests
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...LandingActions,
      ...TableActions,
    }, dispatch),
  },
});

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonIsDisabled: true,
    };
  }

  render() {
    const {
      actions,
      history,
      messages,
    } = this.props;

    const buttonIsDisabled = this.state.buttonIsDisabled;

    return (
      <div className="landing">
        <SpreadsheetCreator
          beforeRecaptchaExecute={() => this.setState({ buttonIsDisabled: true })}
          history={history}
          onErrors={(errors) => {
            actions.setLandingMessages(errors);
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
              variant="raised"
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
        <div className="messages">
          <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

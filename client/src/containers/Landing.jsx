import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'material-ui/Button';
import React from 'react';

import './Landing.css';
import * as LandingActions from '../actions/landing';
import * as MetaActions from '../actions/meta';
import * as TableActions from '../actions/table';
import SpreadsheetCreator from '../components/SpreadsheetCreator';

const mapStateToProps = (state) => ({
  messages: state.getIn(['landing', 'messages']),
  buttonIsDisabled: state.getIn(['landing', 'buttonIsDisabled']),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...LandingActions,
      ...MetaActions,
      ...TableActions,
    }, dispatch),
  },
});

class Landing extends React.Component {
  render() {
    const {
      actions,
      buttonIsDisabled,
      history,
      messages,
    } = this.props;

    const outputMessages = [];
    messages.forEach((message) => {
      outputMessages.push(<li key={message}>{message}</li>);
    });

    return (
      <div className="landing">
        <SpreadsheetCreator
          actions={actions}
          beforeRecaptchaExecute={() => actions.disableLandingButton(true)}
          history={history}
          onErrors={(errors) => actions.setLandingMessages(errors)}
          onRecaptchaResolved={() => actions.disableLandingButton(false)}
          openInNewTab={false}
          recaptchaSitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          ripple={true}
        >
          <Button
            color="primary"
            disabled={buttonIsDisabled}
            raised
          >
            create spreadsheet
          </Button>
        </SpreadsheetCreator>
        <div className="messages">
          <ul>
            {outputMessages}
          </ul>
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

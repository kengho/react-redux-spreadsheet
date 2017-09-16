import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'material-ui/Button';
import React from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

import './Landing.css';
import { initialState } from '../core';
import * as LandingActions from '../actions/landing';
import * as MetaActions from '../actions/meta';
import * as TableActions from '../actions/table';
import fetchServer from './../lib/fetchServer';
import getRootPath from './../lib/getRootPath';

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

const DELAY_BEFORE_ACTION = 200;

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.recaptcha = null;
    this.onButtonClickHandler = this.onButtonClickHandler.bind(this);
    this.onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
  }

  onRecaptchaResolved(evt) {
    const table = initialState().toJS().table;

    // TODO: consider storage session data.
    delete table.session;

    // Without JSON.stringify Rails tries to parse the whole table,
    // but we only want it to store JSON we sent.
    const JSONTable = JSON.stringify(table);
    let fetchParams = { table: JSONTable };
    if (this.recaptcha) {
      fetchParams['g-recaptcha-response'] = this.recaptcha.getResponse();
    }

    fetchServer('POST', 'create', fetchParams)
      .then((json) => {
        if (json.errors) {
          const errors = json.errors.map((error) => error.detail);
          this.props.actions.setMessages(errors);
        } else {
          const shortId = json.data.short_id;
          const spreadsheetPath = `${getRootPath()}${shortId}`;

          // store's shortId used in handleRequestsChanges().
          this.props.actions.setShortId(shortId);
          this.props.actions.tableSetFromJSON(JSONTable);
          this.props.history.push(spreadsheetPath);
        }

        this.props.actions.disableLandingButton(false);
      });
  }

  onButtonClickHandler() {
    setTimeout(
      () => {
        // TODO: add some kind of spinner.
        this.props.actions.disableLandingButton(true);

        if (this.recaptcha) {
          this.recaptcha.execute();
        } else {
          this.onRecaptchaResolved();
        }
      },
      DELAY_BEFORE_ACTION
    );
  }

  render() {
    const buttonIsDisabled = this.props.buttonIsDisabled;

    const recaptchaSitekey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

    const outputMessages = [];
    this.props.messages.forEach((message) => {
      outputMessages.push(<li key={message}>{message}</li>);
    });

    return (
      <div className="landing">
        <Button
          color="primary"
          disabled={buttonIsDisabled}
          onClick={this.onButtonClickHandler}
          raised
        >
          create spreadsheet
        </Button>
        <div className="messages">
          <ul>
            {outputMessages}
          </ul>
        </div>
        {recaptchaSitekey &&
          <Recaptcha
            ref={(c) => { this.recaptcha = c; }}
            sitekey={recaptchaSitekey}
            onResolved={this.onRecaptchaResolved}
          />
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

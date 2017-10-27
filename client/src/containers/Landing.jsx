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
import rippleButtonAction from '../lib/rippleButtonAction';
import serverSyncParams from '../lib/serverSyncParams';

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
  constructor(props) {
    super(props);

    this.recaptcha = null;
    this.onButtonClickHandler = this.onButtonClickHandler.bind(this);
    this.onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
  }

  onRecaptchaResolved(evt) {
    const table = initialState().get('table');

    let params = serverSyncParams(table);
    if (this.recaptcha) {
      params['g-recaptcha-response'] = this.recaptcha.getResponse();
    }

    // TODO: handle errors if server not responding.
    // TODO: consider offline mode.
    //   Issues:
    //   1 short_id?
    fetchServer('POST', 'create', params)
      .then((json) => {
        if (json.errors) {
          const errors = json.errors.map((error) => error.detail);
          this.props.actions.landingSetMessages(errors);
        } else {
          const shortId = json.data.short_id;
          const spreadsheetPath = `${getRootPath()}${shortId}`;

          // store's shortId used in handleRequestsChanges().
          this.props.actions.metaSetShortId(shortId);

          // TODO: set table from immutable object here, not json.
          this.props.actions.tableSetFromJSON(JSON.stringify(table));
          this.props.history.push(spreadsheetPath);
        }

        this.props.actions.landingDisableButton(false);
      });
  }

  onButtonClickHandler(evt) {
    const action = () => {
      // TODO: add some kind of spinner.
      this.props.actions.landingDisableButton(true);

      if (this.recaptcha) {
        this.recaptcha.execute();
      } else {
        this.onRecaptchaResolved();
      }
    }

    rippleButtonAction(action)(evt);
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

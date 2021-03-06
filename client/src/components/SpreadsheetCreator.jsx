import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

import './SpreadsheetCreator.css';
import { initialState } from '../core';
import fetchServer from './../lib/fetchServer';
import getRootPath from './../lib/getRootPath';
import getSufficientState from '../lib/getSufficientState';
import rippleButtonAction from '../lib/rippleButtonAction';

const propTypes = {
  beforeRecaptchaExecute: PropTypes.func,
  disabled: PropTypes.bool,
  history: PropTypes.object,
  onErrors: PropTypes.func,
  onRecaptchaLoaded: PropTypes.func,
  onRecaptchaResolved: PropTypes.func,
  openInNewTab: PropTypes.bool,
  recaptchaSitekey: PropTypes.string,
};

const defaultProps = {
  beforeRecaptchaExecute: () => {},
  disabled: false,
  onErrors: () => {},
  onRecaptchaLoaded: () => {},
  onRecaptchaResolved: () => {},
  openInNewTab: false,
};

class SpreadsheetCreator extends React.PureComponent {
  constructor(props) {
    super(props);

    this.recaptcha = null;
  }

  onRecaptchaResolvedHandler = (evt) => {
    const {
      history,
      onErrors,
      onRecaptchaResolved,
      openInNewTab,
    } = this.props;

    onRecaptchaResolved();

    const state = initialState();
    let params = { state: getSufficientState(state) };
    if (this.recaptcha) {
      params['g-recaptcha-response'] = this.recaptcha.getResponse();
      this.recaptcha.reset();
    }

    fetchServer('POST', 'create', params)
      .then((json) => {
        if (json.errors) {
          const errors = json.errors.map((error) => error.detail);
          onErrors(errors);
        } else {
          const shortId = json.data.short_id;
          const spreadsheetPath = `${getRootPath()}${shortId}`;
          if (history && !openInNewTab) {
            history.push(spreadsheetPath);
          } else {
            // NOTE: TODO: code for "New spreadsheet" button (not yet implemented).
            // actions.setNewSpreadsheetPath(spreadsheetPath);
          }
        }
      });
  };

  onChildrenClickHandler = (evt) => {
    const beforeRecaptchaExecute = this.props.beforeRecaptchaExecute;

    const action = () => {
      beforeRecaptchaExecute();

      if (this.recaptcha) {
        this.recaptcha.execute();
      } else {
        this.onRecaptchaResolvedHandler();
      }
    }

    rippleButtonAction(action)(evt);
  };

  render() {
    const {
      children,
      disabled,
      onRecaptchaLoaded,
      recaptchaSitekey,
    } = this.props;

    let clickableChildren = children;
    if (!disabled) {
      clickableChildren = React.cloneElement(children, {
        onClick: this.onChildrenClickHandler,
        key: 'children',
      });
    }

    return (
      <React.Fragment>
        {clickableChildren}
        {recaptchaSitekey &&
          <Recaptcha
            onLoaded={onRecaptchaLoaded}
            onResolved={this.onRecaptchaResolvedHandler}
            ref={(c) => this.recaptcha = c}
            sitekey={recaptchaSitekey}
          />
        }
      </React.Fragment>
    );
  }
}

SpreadsheetCreator.propTypes = propTypes;
SpreadsheetCreator.defaultProps = defaultProps;

export default SpreadsheetCreator;

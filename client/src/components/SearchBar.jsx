import ArrowDownward from 'material-ui-icons/ArrowDownward';
import ArrowUpward from 'material-ui-icons/ArrowUpward';
import Button from 'material-ui/Button';
import Close from 'material-ui-icons/Close';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

import './SearchBar.css';
import rippleButtonAction from '../lib/rippleButtonAction';
import {
  COLUMN,
  ROW,
} from '../constants';
import findKeyAction from '../lib/findKeyAction';

const propTypes = {
  ui: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

const FORWARD = true;
const BACKWARD = false;
const ANIMATION_TIME_MS = 200;

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    // REVIEW: experimenting with some madvanced internal
    //   state here, doesn't it seems too complicated?
    this.state = {
      searchQuery: '',
      searchResults: null,
      currentSearchResultIndex: 0,
      flags: {
        matchCase: false,
        matchWholeWord: false,
        matchRegexp: false,
      },
    };

    this.flagsMap = {
      matchCase: {
        label: 'match case',
      },
      matchWholeWord: {
        label: 'whole word',
      },
      matchRegexp: {
        label: 'regexp',
      },
    };

    this.textInput = null;
  }

  componentDidUpdate(prevProps, prevState) {
    const focus = this.props.ui.getIn(['search', 'focus']);

    // NOTE: immediate focus required in order not to lose it while
    //   pressing Enter hopping from one search result to another.
    if (focus && this.textInput) {
      this.textInput.focus();
    }

    // NOTE: setTimeout is required for focus after
    //   appearing SearchBar if there is css transition.
    setTimeout(() => {
      if (focus && this.textInput) {
        this.textInput.focus();
      }
    }, ANIMATION_TIME_MS);

    // NOTE: if there is css transition, textInput don't lose focus after closing SearchBar.
    // NOTE: this is also required if there are no visibility css prop (in order to animate disappear).
    setTimeout(() => {
      if (!focus && this.textInput) {
        this.textInput.blur();
      }
    }, ANIMATION_TIME_MS);
  }

  keyDownHandler = (evt) => {
    evt.nativeEvent.stopImmediatePropagation();

    const action = findKeyAction(evt, [
      {
        key: 'Enter',
        action: () => {
          evt.preventDefault();
          this.searchInDirection(FORWARD);
          this.textInput.focus();
        },
      },
      {
        key: 'Escape',
        action: () => {
          this.props.actions.closeSearchBar();
        },
      },
      {
        key: 'F3',
        action: () => {
          evt.preventDefault();
          this.searchInDirection(FORWARD);
        },
      },
      {
        key: 'F3',
        shiftKey: true,
        action: () => {
          evt.preventDefault();
          this.searchInDirection(BACKWARD);
        },
      },
      {
        which: 70, // Ctrl+F
        ctrlKey: true,
        action: () => {
          evt.preventDefault();
        },
      },
    ]);

    if (action) {
      evt.nativeEvent.stopImmediatePropagation();
      action();
    }
  }

  handleInputChange = (evt) => {
    this.setState({
      searchQuery: evt.target.value,
      searchResults: null,
      currentSearchResultIndex: 0,
    });
  }

  search = (rows, searchQuery, flags = {}) => {
    const matcher = (string, searchQuery, flags) => {
      let effectiveString = string;
      let effectiveSearchQuery = searchQuery;
      if (!flags.matchCase) {
        effectiveString = effectiveString.toLowerCase();
        effectiveSearchQuery = effectiveSearchQuery.toLowerCase();
      }

      if (flags.matchWholeWord) {
        if (flags.matchRegexp) {
          return string.match(`^${searchQuery}$`);
        } else {
          return (effectiveString === effectiveSearchQuery);
        }
      } else {
        if (flags.matchRegexp) {
          return string.match(searchQuery);
        } else {
          return effectiveString.includes(effectiveSearchQuery);
        }
      }
    }

    const searchResults = [];
    rows.forEach((row, rowIndex) => {
      row.get('cells').forEach((cell, columnIndex) => {
        if (cell && cell.get('value') && matcher(cell.get('value'), searchQuery, flags)) {
          searchResults.push({
            [ROW]: {
              index: rowIndex,
            },
            [COLUMN]: {
              index: columnIndex,
            },
          });
        }
      });
    });

    return searchResults;
  }

  performSearch = (callback) => {
    const searchResults = this.search(
      this.props.table.getIn(['layout', ROW, 'list']),
      this.state.searchQuery,
      this.state.flags
    );
    this.setState({ searchResults }, callback);
  }

  gotoCurrentSearchResult = () => {
    const currentSearchResult = this.state.searchResults[this.state.currentSearchResultIndex];
    this.props.actions.movePointer({ cell: { ROW: { index: currentSearchResult[ROW].index }}});
    this.props.actions.movePointer({ cell: { COLUMN: { index: currentSearchResult[COLUMN].index }}});
  }

  gotoNextSearchResult = () => {
    this.incrementCurrentSearchResultIndex(() => {
      this.gotoCurrentSearchResult();
    });
  }

  gotoPreviousSearchResult = () => {
    this.decrementCurrentSearchResultIndex(() => {
      this.gotoCurrentSearchResult();
    });
  }

  incrementCurrentSearchResultIndex = (callback) => {
    let nextSearchResultIndex = this.state.currentSearchResultIndex + 1;
    if (nextSearchResultIndex >= this.state.searchResults.length) {
      nextSearchResultIndex = 0;
    }

    this.setState({ currentSearchResultIndex: nextSearchResultIndex }, callback);
  }

  decrementCurrentSearchResultIndex = (callback) => {
    let previousSearchResultIndex = this.state.currentSearchResultIndex - 1;
    if (previousSearchResultIndex < 0) {
      previousSearchResultIndex = this.state.searchResults.length - 1;
    }

    this.setState({ currentSearchResultIndex: previousSearchResultIndex }, callback);
  }

  searchInDirection = (direction) => {
    if (this.state.searchQuery === '') {
      return;
    }

    if (this.state.searchResults === null) {
      this.performSearch(
        () => {
          if (this.state.searchResults.length > 0) {
            this.gotoCurrentSearchResult();
          }
        }
      );
    } else {
      if (direction === FORWARD) {
        this.gotoNextSearchResult();
      } else {
        this.gotoPreviousSearchResult();
      }
    }
  }

  handleSubmit = (evt) => {
    // Prevents reloading page on submit.
    evt.preventDefault();

    if (this.textInput) {
      this.textInput.focus();
    }

    this.searchInDirection(FORWARD);
  }

  render() {
    const {
      actions,
      ui,
    } = this.props;
    const visibility = ui.getIn(['search', 'visibility']);

    let searchResultsSummary;
    if (this.state.searchResults !== null) {
      if (this.state.searchResults.length > 0) {
        searchResultsSummary = `${this.state.currentSearchResultIndex + 1}/${this.state.searchResults.length}`;
      } else {
        searchResultsSummary = 'no matches';
      }
    }

    return (
      <Paper
        onKeyDown={this.keyDownHandler}
        elevation={24}
        square={true}
        style={{
          bottom: visibility ? 0 : -64, // TODO: calc and use actual Paper height.
          opacity: visibility ? 1 : 0,
          position: 'fixed',
          transition: `bottom ${ANIMATION_TIME_MS/1000}s, opacity ${ANIMATION_TIME_MS/1000 * 2}s`,
        }}
        id="search-bar"
      >
        <form id="search-bar-left-block" onSubmit={this.handleSubmit}>
          <Input
            classes={{
              // NOTE: for some reason it still requires ::after selector.
              underline: 'search-bar-input'
            }}
            id="search-bar-field"
            inputRef={(c) => { this.textInput = c; }}
            onChange={this.handleInputChange}
            placeholder="Enter search query..."
            type="search"
            value={this.state.searchQuery}
          />
          <div id="search-bar-search-buttons">
            <Tooltip title="Search previous">
              <IconButton onClick={rippleButtonAction(() => this.searchInDirection(BACKWARD))}>
                <ArrowUpward />
              </IconButton>
            </Tooltip>
            <Tooltip title="Search next">
              <IconButton type="submit" >
                <ArrowDownward />
              </IconButton>
            </Tooltip>
          </div>
          <div id="search-bar-flag-buttons">
            {
              Object.keys(this.flagsMap).map((flag) =>
                <Button
                  size="small"
                  className="search-bar-flag-button"
                  key={`search-bar-${flag}-button`}
                  style={
                    // TODO: use outlined variant when available.
                    //   https://github.com/mui-org/material-ui/blob/3353f440053222b4eed36f575593b5bfcfa7a0f3/pages/api/button.md

                    // Temp outlined implementation:
                    this.state.flags[flag] ? {
                      border: '1px solid rgba(0, 0, 0, 0.23)',
                      borderRadius: '4px',
                    } : {
                      border: '1px solid rgba(0, 0, 0, 0)',
                    }
                  }
                  variant={/* this.state.flags[flag] ? 'outlined' : */ 'flat'}
                  onClick={() => {
                    this.setState(
                      (prevState) => {
                        const nextState = {
                          ...prevState,
                          ...{
                            searchResults: null,
                            currentSearchResultIndex: 0,
                          },
                        };
                        nextState.flags[flag] = !nextState.flags[flag];

                        return nextState;
                      },
                      () => this.searchInDirection(FORWARD)
                    );
                  }}
                >
                  {this.flagsMap[flag].label}
                </Button>
              )
            }
          </div>
          <Typography
            variant="caption"
            id="search-bar-results-summary"
          >
            {searchResultsSummary}
          </Typography>
        </form>
        <IconButton
          id="search-bar-close-button"
          onClick={rippleButtonAction(() => actions.closeSearchBar())}
        >
          <Close />
        </IconButton>
      </Paper>
    );
  }
}

SearchBar.propTypes = propTypes;

export default SearchBar;

# Spreadsheet

## Summary

[rails](http://rubyonrails.org/)-[react](https://facebook.github.io/react/)-[redux](http://redux.js.org/docs/introduction/)-powered spreadsheet, where you can do basic spreadsheeting.

![main view](/doc/img/main.png?raw=true)

## Live

[https://kengho.tech/spreadsheet](https://kengho.tech/spreadsheet/)

## Features

* automatic sync with server with requests queue
* export/import to/from CSV
* basic hotkeys handlers (`ArrowX`, `Enter`, `Escape`, `F2`, `PageDown`, `PageUp`, `Home`, `End`, `Delete`)
* copy/cut/paste cells (`Ctrl+C`, `Ctrl+X`, `Ctrl+V`)
* [redux-undo](https://github.com/omnidan/redux-undo)-powered undo/redo (`Ctrl+Z`, `Ctrl+Y`)
* multiline text (`Ctrl+Enter`)
* autosizing cells
* delete/insert row/column buttons
* automatically expanding table
* built-in invisible Google reCAPTCHA
* clean material-ish design

## Installing

### Development

```
git clone https://github.com/kengho/react-redux-spreadsheet spreadsheet
cd spreadsheet
bundle install
cp .env.example .env
nano .env
# setup these variables (VARIABLE1=value1\n...):
# SECRET_KEY_BASE,
# DB_USERNAME,
# DB_PASSWORD,
# DB_HOST (default 'localhost'),
# DB_PORT (default '5432'),
# PORT (default '4000')
# RAILS_RELATIVE_URL_ROOT (g.e. "/spreadsheet")
# RECAPTCHA_SECRET_KEY (add for reCAPTCHA support)
rake db:setup

cd client
npm insall
cp .env.example .env
nano .env
# setup these variables:
# REACT_APP_SERVER_PORT (default '4000')
# REACT_APP_RELATIVE_URL_ROOT (g.e. "/spreadsheet")
# REACT_APP_RECAPTCHA_SITE_KEY (add for reCAPTCHA support)

cd ..
foreman start -f Procfile.dev
```

http://localhost:3000/spreadsheet should display landing page.

### Production

[kengho.tech spreadsheet deploy instructions](https://gist.github.com/kengho/33a3e3da78006be1c9176af419f77063) (Puma + Nginx).

[kengho.tech ssl deploy instructions](https://gist.github.com/kengho/35114761b5ba338ed260a20c063df209) (Let’s Encrypt).

[get reCAPTCHA keys](https://www.google.com/recaptcha/admin)

## Known issues

* doesn't work with touch devices
* may be slow on really large spreadsheets (>100x100)
* clicking on cell sometimes (rarely) doesn't triggers pointed cell update immediately, little pointer nudge is required

## TODO (random order)

* mobile clients support
* retrieve history for each cell
* cut/copy/paste multiple cells/columns/rows
* cells, linked with other spreadsheets
* sort
* lists (in form of just links to other spreadsheets)
* consider users' auth
* private spreadsheets
* block/clone/crop spreadsheet
* multiple users collaboration
* cells' styling
* sync user session (pointer and stuff) with server
* cell context menu (?)
* context actions panel
* embedding (?)
* optimize CPU, memory and traffic usage
* fix all code imperfections (`REVIEW`, `TODO`, etc.)
* i18n
* scripting
* customize max width for columns (with dblclick for optimal width)
* more spreadsheeting
* full xlsx compatibility (just a joke)

## License

Spreadsheet is distributed under the MIT-LICENSE.

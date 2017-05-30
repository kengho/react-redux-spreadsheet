# Spreadsheet

## Summary

[rails](http://rubyonrails.org/)-[react](https://facebook.github.io/react/)-[redux](http://redux.js.org/docs/introduction/)-powered spreadsheet, where you can do basic spreadsheeting.

![main view](/doc/img/main.png?raw=true)

## Live

[https://kengho.tech/spreadsheet](https://kengho.tech/spreadsheet)

## Features

* automatic sync with server with requests queue
* basic hotkeys handlers (`ArrowX`, `Enter`, `Escape`, `F2`, `PageDown`, `PageUp`, `Home`, `End`, `Delete`)
* click/dblclick handlers
* multiline text (`Ctrl+Enter`)
* autosizing cells
* delete/insert row/column buttons
* automaticly expanding table
* built-in invisible Google reCAPTCHA
* clean material-ish desing

## Installing

### Development

```
git clone https://github.com/kengho/react-redux-spreadsheet spreadsheet
cd spreadsheet
bundle install
npm insall
nano .env
# setup these variables (VARIABLE1=value1\n...):
# SECRET_KEY_BASE,
# DB_USERNAME,
# DB_PASSWORD,
# DB_HOST (default 'localhost'),
# DB_PORT (default '5432'),
# PORT (default '3000')
# RECAPTCHA_SITE_KEY (add for reCAPTCHA support)
# RECAPTCHA_SECRET_KEY (add for reCAPTCHA support)
rake db:setup
foreman start -f Procfile.dev
```
http://localhost:3000/spreadsheet should display langing page.

### Production

[kengho.tech spreadsheet deploy instructions](https://gist.github.com/kengho/33a3e3da78006be1c9176af419f77063) (Puma + Nginx).

[kengho.tech ssl deploy instructions](https://gist.github.com/kengho/35114761b5ba338ed260a20c063df209) (Let’s Encrypt).

[get reCAPTCHA keys](https://www.google.com/recaptcha/admin)

## Known issues

* doesn't work with touch devices
* may be slow on really large spreadsheets (>100x100)

## TODO (random order)

* mobile clients support
* undo/redo (`Ctrl+Z` and `Ctrl+Y`)
* cut/copy/paste (`Ctrl+X`, `Ctrl+C` and `Ctrl+V`) multiple cells
* linked with other spreadsheets values
* sort
* lists (in form of just links to other spreadsheets)
* consider users' auth
* block/clone/crop spreadsheet
* export/import (CSV, ...)
* multiple users collaboration
* cells' styling
* sync user session (pointer and stuff) with server
* cell context menu (?)
* move `Spreadsheet` into own npm package with various settings (?)
* embedding (?)
* actions panel
* optimize CPU, memory and traffic usage
* fix all code imperfections (`REVIEW`, `TODO`, etc.)
* i18n
* scripting
* customize max width for columns
* trim new lines when user deletes all visible text (?)
* statistics page (?)
* admin web tools (?)
* consider rendering infinite empty grid at startup
* more spreadsheeting
* full xlsx compatibility (just a joke)

## License

Spreadsheet is distributed under the MIT-LICENSE.

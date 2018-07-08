# Spreadsheet

## Summary

[rails](http://rubyonrails.org/)-[react](https://facebook.github.io/react/)-[redux](http://redux.js.org/docs/introduction/)-powered spreadsheet, where you can do basic spreadsheeting.

![main view](/doc/img/main.png?raw=true?v=v2)

## Live

[https://kengho.tech/spreadsheet](https://kengho.tech/spreadsheet/)

## Features

* auto sync with server
* auto saving cells' values history
* export/import to/from CSV/JSON
* basic hotkeys handlers (`ArrowX`, `Enter`, `Escape`, `F2`, `PageDown`, `PageUp`, `Delete`)
* copy/cut/paste cells (`Ctrl+C`, `Ctrl+X`, `Ctrl+V`)
* [redux-undo](https://github.com/omnidan/redux-undo)-powered undo/redo (`Ctrl+Z`, `Ctrl+Y`)
* multiline text (`Ctrl+Enter`)
* infinite 2D grid
* built-in invisible Google reCAPTCHA
* clean material design

## Changelog

### v2

* data model changed to a different more logical and fast way
* **(breaking)** (effect of above) database scheme changed too, but migration is supplied
* **(breaking)** spreadsheet is now scalable with new infinite layout and dynamic loading
* (effect of above) there are custom search bar now
* **(breaking)** lines are now don't grow automatically due to technical difficulties (performance, scroll-consistency, and other)
* (effect of above) user can resize lines manually
* **(breaking)** UI for cells, lines and entire spreadsheet is now handled by rightclick context menu, not buttons
* there are no more requests queue, updating algorithm was adjusted
* huge changes to the code style occurred, many performance- and readability-wise patterns applied

### v1

* first version

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

* may be slow on really large spreadsheets (>100x100)

## TODO (random order)

* mobile browsers support
* scripting (aka "functions")
* cut/copy/paste multiple cells/columns/rows
* cells, linked with other spreadsheets
* lists (in form of just links to other spreadsheets)
* consider users' auth
* private spreadsheets
* password protect (preferably the way even server owner can't access user data)
* block/clone spreadsheet
* multiple users collaboration
* cells' styling
* context actions panel
* embedding (?)
* sync user session (pointer and stuff) with server (?)
* optimize CPU, memory and traffic usage
* fix all code imperfections
* consider RLE compression for data (see ODS format)
* i18n
* add/delete lines' and other animations (?)
* to perfect lines sizing (double click for optimal size, consider returning autogrowth)
* more spreadsheeting
* full xlsx compatibility (just a joke)

## License

Spreadsheet is distributed under the MIT-LICENSE.

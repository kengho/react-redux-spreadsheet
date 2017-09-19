APP_PATH=/var/www/kengho.tech/spreadsheet
cd $APP_PATH

# get code
# run this if you changed some file locally:
# git reset --hard
git pull origin master

# prepare environment
bundle install --without development test
RAILS_ENV=production bundle exec rake db:migrate
cd client
npm install --production

# build and replace bundle
npm run build
rm ../public/* -rf; cp -a build/. ../public

# restart
# sudo systemctl restart spreadsheet.service
# sudo service nginx restart

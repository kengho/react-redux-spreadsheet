# get code
APP_PATH=/var/www/kengho.tech/spreadsheet
cd $APP_PATH
git pull origin master

# prepare environment
bundle install --without development test
npm install --production
RAILS_ENV=production bundle exec rake db:migrate

# build and replace bundle
BUILD_PATH=`mktemp --directory --tmpdir="$APP_PATH"`
npm run production:client -- --env.output "$BUILD_PATH"
ASSETS_PATH=public/assets
rm $APP_PATH/$ASSETS_PATH/* -rf
cp $BUILD_PATH/* $APP_PATH/$ASSETS_PATH
rm $BUILD_PATH -rf

# restart Puma
sudo systemctl restart puma.service
# sudo service nginx restart

# 'puma -C config/puma.rb' doesn't load rails app, resulting in lack of ENV vars.
require 'rails'
require 'dotenv-rails'
Dotenv.load

workers ENV.fetch('WEB_CONCURRENCY') { 1 }

threads_count = ENV.fetch('RAILS_MAX_THREADS') { 5 }.to_i
threads threads_count, threads_count

rails_env = ENV.fetch('RAILS_ENV') { 'development' }
environment rails_env

if rails_env == 'production'
  # https://www.digitalocean.com/community/tutorials/how-to-deploy-a-rails-app-with-puma-and-nginx-on-ubuntu-14-04
  # Directory for PID, state, logs and socket file
  app_dir = File.expand_path('../..', __FILE__)
  shared_dir = "#{app_dir}/shared"

  stdout_redirect "#{shared_dir}/log/puma.stdout.log", "#{shared_dir}/log/puma.stderr.log", true

  pidfile "#{shared_dir}/pids/puma.pid"
  state_path "#{shared_dir}/pids/puma.state"
  activate_control_app

  bind "unix://#{shared_dir}/sockets/puma.sock"

  on_worker_boot do
    require 'active_record'
    ActiveRecord::Base.connection.disconnect! rescue ActiveRecord::ConnectionNotEstablished
    ActiveRecord::Base.establish_connection(YAML.load_file("#{app_dir}/config/database.yml")[rails_env])
  end
else
  port ENV.fetch('PORT') { 4000 }
end

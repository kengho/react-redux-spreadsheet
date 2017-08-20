Rails.application.routes.draw do
  scope ENV['RAILS_RELATIVE_URL_ROOT'] || '/' do
    namespace :api do
      namespace :v1 do
        match '/create' => "spreadsheet#create", via: [:options, :post]
        match '/show' => "spreadsheet#show", via: [:options, :get]
        match '/update' => "spreadsheet#update", via: [:options, :patch]
        match '/destroy' => "spreadsheet#destroy", via: [:options, :delete]
      end
    end
  end
end

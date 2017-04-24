Rails.application.routes.draw do
  resources :spreadsheet, param: :short_id
end

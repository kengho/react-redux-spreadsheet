class AddSettingsColumn < ActiveRecord::Migration[5.1]
  def change
    add_column :spreadsheets, :settings, :text
  end
end

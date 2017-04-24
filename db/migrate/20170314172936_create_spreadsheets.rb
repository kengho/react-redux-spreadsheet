class CreateSpreadsheets < ActiveRecord::Migration[5.0]
  def change
    enable_extension 'uuid-ossp'
    create_table :spreadsheets, id: :uuid do |t|
      t.text :data, null: false
      t.timestamps
    end
  end
end

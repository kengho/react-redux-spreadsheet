class AddRequestsCounter < ActiveRecord::Migration[5.0]
  def change
    add_column :spreadsheets, :updates_counter, :integer, default: 0
  end
end

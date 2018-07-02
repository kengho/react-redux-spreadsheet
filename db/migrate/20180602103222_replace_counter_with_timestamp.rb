class ReplaceCounterWithTimestamp < ActiveRecord::Migration[5.2]
  def change
    add_column :spreadsheets, :client_timestamp, :datetime, default: Time.new(0)
    remove_column :spreadsheets, :updates_counter, :integer
  end
end

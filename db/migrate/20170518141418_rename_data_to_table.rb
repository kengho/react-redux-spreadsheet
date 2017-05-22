class RenameDataToTable < ActiveRecord::Migration[5.0]
  def change
    rename_column :spreadsheets, :data, :table
  end
end

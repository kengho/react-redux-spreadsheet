class StoreStateInOneColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :spreadsheets, :state, :text, null: false, default: {}.to_json

    Spreadsheet.all.each do |spreadshet|
      old_table_hash = JSON.parse(spreadshet.table)
      new_state = DbConvert.v20171022190242_to_v2018_06_02_192847(old_table_hash)
      spreadshet.update_attributes(state: new_state.to_json)
    end

    remove_column :spreadsheets, :table, :text
    remove_column :spreadsheets, :settings, :text
  end
end

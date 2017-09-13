require 'json'

class AddIdsToLines < ActiveRecord::Migration[5.0]
  def change
    add_ids = lambda do |old_line|
      new_line = old_line.map { |id| { "id" => id } }
    end

    Spreadsheet.all.each do |spreadsheet|
      table_json = spreadsheet.table
      table = JSON.parse(table_json)

      unless table["data"]["rows"].first["id"]
        table["data"]["rows"] = add_ids.call(table["data"]["rows"])
        table["data"]["columns"] = add_ids.call(table["data"]["columns"])
        spreadsheet.update_attributes!(table: table.to_json)
      end
    end
  end
end

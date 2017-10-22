class RenameUnixtimeToTime < ActiveRecord::Migration[5.0]
  Spreadsheet.all.each do |spreadsheet|
    table_json = spreadsheet.table
    begin
      table_array = JSON.parse(table_json)
    rescue => e
      puts "Error transforming spreadsheet with id = #{spreadsheet.id}: #{e}"
      return
    end
    return unless table_array

    table_array['data']['cells'].each do |cellId, cellProps|
      next unless cellProps['history']

      cellProps['history'].each do |record|
        next unless record['unixTime']

        record['time'] = record['unixTime']
        record.delete('unixTime')
      end
    end

    spreadsheet.update_attributes(table: table_array.to_json)
  end
end

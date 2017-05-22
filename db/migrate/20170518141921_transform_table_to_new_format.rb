class TransformTableToNewFormat < ActiveRecord::Migration[5.0]
  def change
    Spreadsheet.all.each do |spreadsheet|
      old_table_json = spreadsheet.table
      begin
        old_table_array = JSON.parse(old_table_json)
      rescue => e
        puts "Error transforming spreadsheet with id = #{spreadsheet.id}: #{e}"
        return
      end
      return unless old_table_array

      rows = []
      columns = []
      cells = {}
      old_table_array.each do |row|
        row_id = "r#{SecureRandom.uuid}"
        rows.push(row_id)

        row.each_with_index do |cell, column_index|
          column_id =
          if columns[column_index]
            columns[column_index]
          else
            id = "c#{SecureRandom.uuid}"
            columns.push(id)
            id
          end

          cell_id = "#{row_id},#{column_id}"
          if cell.keys.length > 1 # not only id prop
            cells[cell_id] = cell.reject { |key, _| key === 'id' }
          end
        end
      end

      new_table_json = {
        data: {
          rows: rows,
          columns: columns,
          cells: cells,
        }
      }.to_json
      spreadsheet.update_attributes(table: new_table_json)
    end
  end
end

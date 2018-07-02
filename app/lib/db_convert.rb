module DbConvert
  def v20171022190242_to_v2018_06_02_192847(v20171022190242_table)
    old_data = v20171022190242_table['data']
    old_rows = old_data['rows']
    old_columns = old_data['columns']
    old_cells = old_data['cells']

    row_default_size = 40
    row_margin_size = 30
    column_default_size = 60
    column_margin_size = 50
    new_state = {
      'settings' => {
        'autoSaveHistory' => true,
        'tableHasHeader' => false,
        'spreadsheetName' => 'Spreadsheet',
      },
      'table' => {
        'major' => {
          'layout' => {
            'ROW' => {
              'defaultSize' => row_default_size,
              'marginSize' => row_margin_size,
              'list' => [],
            },
            'COLUMN' => {
              'defaultSize' => column_default_size,
              'marginSize' => column_margin_size,
              'list' => [],
            },
          },
        },
      },
    }

    new_rows = new_state['table']['major']['layout']['ROW']['list']
    old_rows.each do |old_row|
      new_rows.push(
        'id' => old_row['id'][1..-1], # drop first letter
        'size' => row_default_size,
        'cells' => Array.new(old_columns.size),
      )
    end

    new_columns = new_state['table']['major']['layout']['COLUMN']['list']
    old_columns.each do |old_column|
      new_columns.push(
        'id' => old_column['id'][1..-1],
        'size' => column_default_size,
      )
    end

    old_rows.each_with_index do |old_row, row_index|
      old_columns.each_with_index do |old_column, column_index|
        old_cell_id = "#{old_row['id']},#{old_column['id']}"
        old_cell = old_cells[old_cell_id]
        new_cell =
          if old_cell
            cell = old_cell.deep_dup
            cell['history'] = cell['history'].map do |record|
              record['value'] = record['value'] ? record['value'] : ''
              record
            end

            cell
          else
            {}
          end

        new_rows[row_index]['cells'][column_index] = new_cell
      end
    end

    new_state
  end

  module_function :v20171022190242_to_v2018_06_02_192847
end

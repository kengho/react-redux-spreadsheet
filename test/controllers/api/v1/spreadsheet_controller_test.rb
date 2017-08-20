require 'test_helper'

class Api::V1::SpreadsheetControllerTest < ActionController::TestCase
  setup do
    @table_fixture = {
      'rows' => 'some_rows',
      'columns' => 'some_columns',
    }

    Spreadsheet.destroy_all
    Spreadsheet.create!(table: @table_fixture.to_json)
  end

  test 'should create spreadsheet' do
    Spreadsheet.destroy_all

    post(:create, params: { table: @table_fixture.to_json })
    created_spreadsheet = Spreadsheet.last

    assert created_spreadsheet
    assert_equal(@table_fixture, JSON.parse(created_spreadsheet.table))

    parsed_response = JSON.parse(response.body)
    data = parsed_response['data']
    assert_equal({ 'short_id' => created_spreadsheet.short_id }, data)
  end

  test 'should return error message if requested spreadshet does not exist' do
    get(:show, params: { short_id: 'non existing id' })

    parsed_response = JSON.parse(response.body)
    errors = parsed_response['errors']
    assert errors
  end

  test 'should show spreadsheet' do
    showing_spreadsheet = Spreadsheet.last
    get(:show, params: { short_id: showing_spreadsheet.short_id })

    parsed_response = JSON.parse(response.body)
    data = parsed_response['data']
    assert_equal({ 'table' => @table_fixture.to_json }, data)
  end

  test 'should update spreadsheet' do
    updated_table_fixture = {
      'rows' => 'some_other_rows',
      'columns' => 'some_other_columns',
    }
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        table: updated_table_fixture.to_json,
        updates_counter: 0,
      })

    updated_spreadsheet = Spreadsheet.last
    assert_equal(updated_table_fixture.to_json, updated_spreadsheet.table)

    parsed_response = JSON.parse(response.body)
    data = parsed_response['data']
    assert_equal({ 'status' => 'OK' }, data)
  end

  test 'should update spreadsheet in intended order' do
    updated_table_fixture1 = {
      'rows' => 'some_other_rows1',
      'columns' => 'some_other_columns1',
    }
    updated_table_fixture2 = {
      'rows' => 'some_other_rows2',
      'columns' => 'some_other_columns2',
    }
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        table: updated_table_fixture2.to_json,
        updates_counter: 2,
      })
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        table: updated_table_fixture1.to_json,
        updates_counter: 1,
      })

    updated_spreadsheet = Spreadsheet.last
    assert_equal(updated_table_fixture2.to_json, updated_spreadsheet.table)
  end

  test 'should destroy spreadsheet' do
    delete(:destroy, params: { short_id: Spreadsheet.last.short_id })

    destroyed_spreadsheet = Spreadsheet.last
    assert_nil destroyed_spreadsheet

    parsed_response = JSON.parse(response.body)
    data = parsed_response['data']
    assert_equal({ 'status' => 'OK' }, data)
  end
end

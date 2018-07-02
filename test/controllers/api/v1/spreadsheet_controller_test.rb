require 'test_helper'

class Api::V1::SpreadsheetControllerTest < ActionController::TestCase
  setup do
    @state_fixture = { 'prop' => 'value' }

    Spreadsheet.destroy_all
    Spreadsheet.create!(state: @state_fixture.to_json)

    # NOTE: format required in order to have correct
    #   types for params in controller instead of strings
    #   (e.g. client_timestamp should be number).
    #   https://github.com/rails/rails/issues/26075#issuecomment-244315017
    request.content_type = 'application/json'
  end

  test 'should create spreadsheet' do
    Spreadsheet.destroy_all

    post(:create, params: { state: @state_fixture })
    created_spreadsheet = Spreadsheet.last

    assert created_spreadsheet
    assert_equal(@state_fixture, JSON.parse(created_spreadsheet.state))

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
    assert_equal({ 'state' => @state_fixture.to_json }, data)
  end

  test 'should update spreadsheet' do
    updated_state_fixture = { 'prop' => 'other_value' }
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        state: updated_state_fixture,
        client_timestamp: 9999999999999,
      },
    )

    updated_spreadsheet = Spreadsheet.last
    assert_equal(updated_state_fixture.to_json, updated_spreadsheet.state)

    parsed_response = JSON.parse(response.body)
    data = parsed_response['data']
    assert_equal({ 'status' => 'OK' }, data)
  end

  test 'should update spreadsheet in intended order' do
    updated_state_fixture1 = { 'prop' => 'value1' }
    updated_state_fixture2 = { 'prop' => 'value2' }
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        state: updated_state_fixture2,
        client_timestamp: 9999999999999,
      },
    )
    patch(
      :update,
      params: {
        short_id: Spreadsheet.last.short_id,
        state: updated_state_fixture1,
        client_timestamp: 9999999999998,
      },
    )

    updated_spreadsheet = Spreadsheet.last
    assert_equal(updated_state_fixture2.to_json, updated_spreadsheet.state)
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

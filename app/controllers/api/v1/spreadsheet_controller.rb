class Api::V1::SpreadsheetController < Api::V1::BaseController
  before_action :prepare, except: [:create]

  def create
    if (
      ENV['RAILS_ENV'] != 'test' &&
      ENV['RECAPTCHA_SECRET_KEY'] &&
      !captcha_is_valid
     )
      throw_error(
        'external', 'CAPTCHA is invalid.'
      ) and return
    end

    # TODO: data check, errors.
    # https://stackoverflow.com/a/14039753/6376451
    state = params.permit!.to_h['state']
    @spreadsheet = Spreadsheet.create!(state: state.to_json)
    response = { 'data' => { 'short_id' => @spreadsheet.short_id } }
    render json: response
  end

  def show
    @response['data'] = { 'state' => @spreadsheet.state }
    render json: @response
  end

  def update
    state = params.permit!.to_h['state']
    client_timestamp = params.permit!.to_h['client_timestamp']
    short_id = params.permit!.to_h['short_id']
    # TODO: data check, errors.

    # TODO: import response codes from constants.js somehow (or store them elsewhere).
    status =
      if @spreadsheet.client_timestamp > client_timestamp
        'ERROR'
      elsif @spreadsheet.update_attributes(state: state.to_json)
        @spreadsheet.update_attributes!(client_timestamp: Time.at(client_timestamp/1000.0))
        'OK'
      else
        'ERROR'
      end

    @response['data'] = { 'status' => status }
    render json: @response
  end

  def destroy
    status =
      if @spreadsheet.destroy
        'OK'
      else
        'ERROR'
      end

    @response['data'] = { 'status' => status }
    render json: @response
  end

  private

    def prepare
      # Handles by routes.rb throwing
      # 'ActionController::UrlGenerationError: No route matches {:action=>"show", :controller=>"api/v1/spreadsheet"}'
      # unless params[:short_id]
      #   throw_error(
      #     'external', 'Expected short_id as param.'
      #   ) and return
      # end

      unless (id = Spreadsheet.id(params[:short_id]))
        throw_error(
          'external', "Error processing spreadsheet ID \"#{params[:short_id]}\"."
        ) and return
      end

      @spreadsheet = Spreadsheet.find_by(id: id)
      unless @spreadsheet
        throw_error(
          'external', 'Spreadsheet doesn\'t exist.'
        ) and return
      end

      @response = {}
    end

    def captcha_is_valid
      captcha_verify_url = 'https://www.google.com/recaptcha/api/siteverify'
      captcha_verify_params = {
        'secret' => ENV['RECAPTCHA_SECRET_KEY'],
        'response' => params['g-recaptcha-response'],
      }

      begin
        response = RestClient.post(
          captcha_verify_url,
          captcha_verify_params,
          accept: :json
        )
      rescue => e
        Rails.logger.error("Error while sending captcha request: \"#{e}\"")
      end

      return false unless response
      return false unless response.code == 200 # TODO: use :ok
      parsed_response = JSON.parse(response)
      return false unless parsed_response['success'] == true

      true
    end
end

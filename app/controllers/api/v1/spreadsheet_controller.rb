class Api::V1::SpreadsheetController < Api::V1::BaseController
  before_action :prepare, except: [:create]

  def create
    if ENV['RAILS_ENV'] != 'test' &&
       ENV['RECAPTCHA_SECRET_KEY'] &&
       !captcha_is_valid
      throw_error(
        'external', 'CAPTCHA is invalid.'
      ) and return
    end

    # TODO: data check, errors.
    @spreadsheet = Spreadsheet.create!(table: params[:table])
    response = { 'data' => { 'short_id' => @spreadsheet.short_id } }
    render json: response
  end

  def show
    # NOTE: I know that GET shouldn't mutate data.
    #   But we need to zerorize updates_counter,
    #   and doing it in separate request is unnecessary complex.
    #   Btw, it doesn't affects GET's idempotence.
    @spreadsheet.update_attributes!(updates_counter: 0)
    @response['data'] = { 'table' => @spreadsheet.table }
    render json: @response
  end

  def update
    # TODO: data check, errors.
    updates_counter = params['updates_counter'].to_i

    status =
      if @spreadsheet.updates_counter > updates_counter
        'OK'
      elsif @spreadsheet.update_attributes(table: params['table'])
        @spreadsheet.update_attributes!(updates_counter: updates_counter + 1)
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
          'external', "Error processing short_id '#{params[:short_id]}'."
        ) and return
      end

      @spreadsheet = Spreadsheet.find_by(id: id)
      unless @spreadsheet
        throw_error(
          'external', 'Spreadsheet doesn\'t exist yet.'
        ) and return
      end

      @response = { 'request_uuid' => params['request_uuid'] }
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
        Rails.logger.error("Error while sending captcha request: '#{e}'")
      end

      return false unless response
      return false unless response.code == 200
      parsed_response = JSON.parse(response)
      return false unless parsed_response['success'] == true

      true
    end
end

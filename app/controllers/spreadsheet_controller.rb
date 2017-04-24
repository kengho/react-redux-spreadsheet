class SpreadsheetController < ApplicationController
  # TODO: for some reason 'real_csrf_token(session)' here:
  #   actionpack-5.0.2/lib/action_controller/metal/request_forgery_protection.rb
  #   and in (for example) in this controller doesn't match. Need to figure out why.
  # skip_before_action :verify_authenticity_token, if: :json_request?
  skip_before_action :verify_authenticity_token
  before_action :prepare, except: [:index, :create]

  def index
    respond_to do |f|
      f.html
    end
  end

  def create
    if ENV['RECAPTCHA_SECRET_KEY']
      unless captcha_is_valid
        flash[:message] = 'Sorry, but CAPTCHA is invalid'
        redirect_to spreadsheet_index_path and return
      end
    end

    # TODO: data check, errors.
    @spreadsheet = Spreadsheet.create!(data: params[:data])
    redirect_to spreadsheet_path(@spreadsheet.short_id)
  end

  def show
    @spreadsheet.update_attributes(updates_counter: 0)
    @short_id = params[:short_id]
    @data = @spreadsheet.data

    respond_to do |f|
      f.html
    end
  end

  def update
    # TODO: data check, errors.
    status =
      if @spreadsheet.updates_counter > params['counter']
        'OK'
      elsif @spreadsheet.update_attributes!(data: params['data'])
        @spreadsheet.update_attributes(updates_counter: params['counter'] + 1)
        'OK'
      else
        'ERROR'
      end

    respond_to do |f|
      f.json { render json: { status: status }.to_json }
    end
  end

  def destroy
    status =
      if @spreadsheet.destroy
        'OK'
      else
        'ERROR'
      end

    respond_to do |f|
      f.json { render json: { status: status }.to_json }
    end
  end

  private

    def json_request?
      request.format.json?
    end

    def prepare
      redirect_to spreadsheet_index_path and return unless params[:short_id]
      unless (id = Spreadsheet.id(params[:short_id]))
        redirect_to spreadsheet_index_path and return
      end
      @spreadsheet = Spreadsheet.find_by(id: id)

      unless @spreadsheet
        flash[:message] = 'Spreadsheet doesn\'t exist yet.'
        redirect_to spreadsheet_index_path and return
      end
      @response = { 'requestUuid' => params['requestUuid'] }
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

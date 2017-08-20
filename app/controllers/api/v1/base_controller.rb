class Api::V1::BaseController < ActionController::Base
  private

    def throw_error(title, detail)
      response = {
        errors: [{
          title: title,
          detail: detail,
        }],
      }

      if title == 'internal'
        response[:errors][0][:detail] <<
          ' Please report error to site\'s owner.'
      end

      render json: response
    end
end

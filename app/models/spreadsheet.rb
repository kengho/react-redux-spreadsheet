class Spreadsheet < ApplicationRecord
  validates_each :state do |record, attr, value|
    unless value && value.size < 10 * 1024 * 1024 # 10 MB
      record.errors.add(attr, 'state size should be between 1b and 10MB')
    end
  end

  # '8113d8b1-3a2c-47e5-8179-23aa07e83262'
  # =>
  # '7n3n8rdbnhjccg61y2kaajbdu'
  def short_id
    id
      .tr('-', '')
      .to_i(16)
      .to_s(36)
  end

  UUID_SIZE = 36
  UUID_REGEXP = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/

  # '7n3n8rdbnhjccg61y2kaajbdu'
  # =>
  # '8113d8b1-3a2c-47e5-8179-23aa07e83262'
  def self.id(short_id)
    begin
      id =
        short_id
        .to_i(36)
        .to_s(16)

      # Leftpad id in case UUID started with zeroes.
      id = id.rjust(UUID_SIZE - 4, '0') # UUID have 4 '-'

      # UUID's '-' places: 8, 12, 16, 20.
      # Each 'insert' shifts remaining places to the right.
      id =
        id
        .insert(8, '-')
        .insert(12 + 1, '-')
        .insert(16 + 1 + 1, '-')
        .insert(20 + 1 + 1 + 1, '-')
    rescue
      Rails.logger.error("Error in Spreadsheet.id('#{short_id}')")
      return nil
    end

    return unless id =~ UUID_REGEXP

    id
  end

  def self.find_by_short_id(short_id)
    id = id(short_id)
    spreadsheet = find_by(id: id)

    spreadsheet
  end
end

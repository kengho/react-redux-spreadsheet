class Spreadsheet < ActiveRecord::Base
  validates_each :table do |record, attr, value|
    unless value.size < 10 * 1024 * 1024 # 10 MB
      record.errors.add(attr, 'table size should be less than 10 MB')
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

  UUID_REGEXP = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/

  # '7n3n8rdbnhjccg61y2kaajbdu'
  # =>
  # '8113d8b1-3a2c-47e5-8179-23aa07e83262'
  def self.id(short_id)
    # UUID's '-' places: 8, 12, 16, 20.
    # Each 'insert' shifts remaining places to the right.
    begin
      id = short_id
           .to_i(36)
           .to_s(16)
           .insert(8, '-')
           .insert(13, '-')
           .insert(18, '-')
           .insert(23, '-')
    rescue
      Rails.logger.error("Error in Spreadsheet.id('#{short_id}')")
      return nil
    end
    return nil unless id =~ UUID_REGEXP

    id
  end

  def self.find_by_short_id(short_id)
    id = id(short_id)
    spreadsheet = find_by(id: id)

    spreadsheet
  end
end

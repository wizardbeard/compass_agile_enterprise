class Widget < ActiveRecord::Base

  has_and_belongs_to_many :applications
  has_many :user_preferences, :as => :preferenced_record

  validates_uniqueness_of :xtype
  validates_uniqueness_of :internal_identifier

end

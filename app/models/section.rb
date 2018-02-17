class Section < ApplicationRecord
  belongs_to :tutorial

  validates :title, presence: true
end

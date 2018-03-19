class Section < ApplicationRecord
  belongs_to :document

  validates :title, presence: true
end

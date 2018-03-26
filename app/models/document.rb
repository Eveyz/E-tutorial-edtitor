class Document < ApplicationRecord
  belongs_to :user
  # has_many :sections

  validates :title, presence: true
end

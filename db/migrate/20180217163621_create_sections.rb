class CreateSections < ActiveRecord::Migration[5.1]
  def change
    create_table :sections do |t|
      t.string :title
      t.text :content
      t.string :ancestry
      t.references :tutorial, foreign_key: true

      t.timestamps
    end
  end
end

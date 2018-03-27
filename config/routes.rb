Rails.application.routes.draw do
  resources :documents do
    collection do
      get "edit_tutorial"
      post "add_new_section"
      post "add_section_content"
      post "select_section"
      post "save_section_new_title"
      get "read"
      delete "delete_section"
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'documents#index'
end

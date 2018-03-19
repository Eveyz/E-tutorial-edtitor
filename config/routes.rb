Rails.application.routes.draw do
  resources :tutorials do
    collection do
      post "add_new_section"
      post "add_section_content"
    end
  end
  
  resources :documents do
    collection do
      post "add_new_section"
      post "add_section_content"
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'documents#index'
end

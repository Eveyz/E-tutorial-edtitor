class DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :edit, :update, :destroy, :add_new_section]
  before_action :initialize_document_json_file, only: [:edit_tutorial]
  before_action :read_sections_from_json_file, only: [:edit_tutorial, :add_new_section, :add_section_content, :select_section, :save_section_new_title, :read]

  # GET /documents
  # GET /documents.json
  def index
    @documents = Document.all
  end

  # GET /documents/1
  # GET /documents/1.json
  def show
  end

  # GET /documents/new
  def new
    @document = Document.new
  end

  # GET /documents/1/edit
  def edit
    # @sections = @document.sections.order('sections.updated_at ASC')
    @sectionsJSON = @sections.to_json
    section = @sections.last
    @currentSectionJSON = {}
    if section.present?
      @currentSection = Section.new(section["id"], section["title"], section["content"], section["ancestry"], section["level"], section["created_at"], section["updated_at"])
    end
    @currentSectionJSON = @currentSection.to_json
  end

  # POST /documents
  # POST /documents.json
  def create
    @user = User.first
    @document = @user.documents.create(document_params)

    respond_to do |format|
      if @document.save
        format.html { redirect_to @document, notice: 'Document was successfully created.' }
        format.json { render :show, status: :created, location: @document }
      else
        format.html { render :new }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /documents/1
  # PATCH/PUT /documents/1.json
  def update
    respond_to do |format|
      if @document.update(document_params)
        format.html { redirect_to @document, notice: 'Document was successfully updated.' }
        format.json { render :show, status: :ok, location: @document }
      else
        format.html { render :edit }
        format.json { render json: @document.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /documents/1
  # DELETE /documents/1.json
  def destroy
    @document.destroy
    respond_to do |format|
      format.html { redirect_to documents_url, notice: 'Document was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def edit_tutorial
    @sectionsJSON = @sections.to_json
    section = @sections.last
    @currentSectionJSON = {}
    if section.present?
      @currentSection = Section.new(section["id"], section["title"], section["content"], section["ancestry"], section["level"], section["created_at"], section["updated_at"])
    end
    @currentSectionJSON = @currentSection.to_json
    @edit = true
  end

  def read
    @sectionsJSON = @sections.to_json
    section = @sections.last
    @currentSectionJSON = {}
    if section.present?
      @currentSection = Section.new(section["id"], section["title"], section["content"], section["ancestry"], section["level"], section["created_at"], section["updated_at"])
    end
    @currentSectionJSON = @currentSection.to_json
    @edit = false
  end

  def add_new_section
    if params[:ancestry].blank? and params[:parent].blank? and params[:level].blank?
      @section_data = Section.create(@count + 1, params[:title], params[:content], "root", 0, Time.now, Time.now)
    else
      if params[:ancestry] == "root"
        ancestry = params[:parent].to_s + "/"
      else
        ancestry = params[:ancestry] + params[:parent].to_s + "/"
      end
      level = params[:level].to_i + 1
      @section_data = Section.create(@count + 1, params[:title], params[:content], ancestry, level, Time.now, Time.now)
    end
    # @sections = @document.sections.order('sections.updated_at ASC')
    @sectionsJSON = @section_data[:sections].to_json
    @section = @section_data[:section]
    @currentSectionJSON = @section.to_json
    respond_to do |format|
      format.js
    end
  end

  def add_section_content
    @section = Section.find(params[:section_id], @sections)
    Section.update_attribute(@section.id, "content", params[:content])
    render json: { status: "successful" }
  end

  def select_section
    @section = Section.find(params[:id], @sections)
    @sectionJSON = @section.to_json
    @edit = params[:edit]
    respond_to do |format|
      format.js
    end
  end

  def save_section_new_title
    @section = Section.find(params[:id], @sections)
    result = Section.update_attribute(@section.id, "title", params[:title])
    render json: { title: result }
  end

  def delete_section
    @sections = Section.delete(params[:id])
    @sectionsJSON = @sections.to_json
    section = @sections.last
    @currentSectionJSON = {}
    if section.present?
      @currentSection = Section.new(section["id"], section["title"], section["content"], section["ancestry"], section["level"], section["created_at"], section["updated_at"])
    end
    @currentSectionJSON = @currentSection.to_json
    @edit = true
    respond_to do |format|
      format.js
    end
  end
    
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_document
      @document = Document.find(params[:id])
    end

    def initialize_document_json_file
      if not File.exists?(Section::SECTION_JSON_FILE)
        initial_data = { sections: [], count: 0 }
        File.open(Section::SECTION_JSON_FILE,"w") do |f|
          f.puts JSON.pretty_generate(initial_data)
        end
      end
    end

    def read_sections_from_json_file
      data = Section.load_data_from_json_file
      @sections = data["sections"]
      @count = data["count"]
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params
      params.require(:document).permit(:title, :description, :user_id)
    end
end

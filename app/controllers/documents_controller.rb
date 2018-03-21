class DocumentsController < ApplicationController
  before_action :set_document, only: [:show, :edit, :update, :destroy, :add_new_section]

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
    @sections = @document.sections.order('sections.updated_at ASC')
    @sectionsJSON = @sections.as_json.to_json
    @currentSection = @sections.last
    p @currentSection
    @currentSectionJSON = @currentSection.as_json.to_json
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

  def add_new_section
    if params[:ancestry].blank? and params[:parent].blank? and params[:level].blank?
      @section = @document.sections.create(title: params[:title], ancestry: "root", level: 0)
    else
      if params[:ancestry] == "root"
        ancestry = params[:parent].to_s + "/"
      else
        ancestry = params[:ancestry] + params[:parent].to_s + "/"
      end
      level = params[:level].to_i + 1
      @section = @document.sections.create(title: params[:title], ancestry: ancestry, level: level)
    end
    @sections = @document.sections.order('sections.updated_at ASC')
    @sectionsJSON = @sections.as_json.to_json
    @currentSectionJSON = @section.as_json.to_json
    respond_to do |format|
      format.js
    end
  end

  def add_section_content
    @section = Section.find(params[:section_id])
    @section.content = params[:content]
    @section.save
  end

  def select_section
    @section = Section.find(params[:id])
    @sectionJSON = @section.as_json
    respond_to do |format|
      format.js
    end
    # render json: { section: @section }
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_document
      @document = Document.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def document_params
      params.require(:document).permit(:title, :description, :user_id)
    end
end

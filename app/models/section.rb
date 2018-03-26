class Section
  attr_accessor :id, :title, :content, :ancestry, :level, :document_id, :create_at, :updated_at

  SECTION_JSON_FILE = "lib/document.json"

  def initialize(id, title, content, ancestry, level, create_at, updated_at)
    @id = id
    @title = title
    @content = content
    @ancestry = ancestry
    @level = level
    @create_at = create_at
    @updated_at = updated_at
  end

  def self.find(id, sections)
    sections.each do |section|
      if section["id"] == id.to_i
        section_obj = Section.new(section["id"], section["title"], section["content"], section["ancestry"], section["level"], section["created_at"], section["updated_at"])
        return section_obj
      end
    end
    return nil
  end

  def self.load_data_from_json_file
    begin
      file = File.read SECTION_JSON_FILE
      data = JSON.parse(file)
      return data
    rescue
      return false
    end
  end

  def self.create(id, title, content, ancestry, level, create_at, updated_at)
    section = self.new(id, title, content, ancestry, level, create_at, updated_at)
    tempHash = {
      "id": id,
      "title": title,
      "content": content,
      "ancestry": ancestry,
      "level": level,
      "created_at": create_at,
      "updated_at": updated_at
    }
    self.add_new_section_to_json_file(tempHash)
    return { section: section, sections: self.load_data_from_json_file["sections"] }
  end

  def self.update_attribute(id, field, value)
    data = Section.load_data_from_json_file
    sections = data["sections"]
    sections.each do |sec|
      if sec["id"] == id
        sec[field] = value
      end
    end
    if self.write_to_file(data)
      return value
    else
      return false
    end
  end

  def self.add_new_section_to_json_file(tempHash)
    data = Section.load_data_from_json_file
    data["count"] += 1
    data["sections"] << tempHash
    self.write_to_file(data)
  end

  def self.write_to_file(data)
    begin
      File.open(SECTION_JSON_FILE,"w") do |f|
        f.puts JSON.pretty_generate(data)
      end
      return true
    rescue
      return false
    end
  end

end

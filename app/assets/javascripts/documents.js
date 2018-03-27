function hoverSectionIn(id) {
  const sectionLink = "#section-" + id + " a span";
  $(sectionLink).children(".icon-plus").show();
};

function hoverSectionOut(id) {
  const sectionLink = "#section-" + id + " a span";
  $(sectionLink).children(".icon-plus").hide();
};

function changeSectionTitle(sectionID) {
  var ele, val, input;
  ele = $("#section-title-editor");
  val = ele.text();
  ele.replaceWith('<div class="input-group mb-3" id="newSectionTitleInputContainer"><input id="newSectionTitleInput" type="text" class="form-control" value="' + val + '" placeholder="title" aria-label="title" aria-describedby="basic-addon2"><div class="input-group-append"><button class="btn btn-outline-secondary" onClick="saveNewSectionTitle(' + sectionID + ');" type="button">Save</button></div></div>');
};

function saveNewSectionTitle(sectionID) {
  var val;
  val = $("#newSectionTitleInput").val();
  $.ajax({
    url: "/documents/save_section_new_title",
    type: "POST",
    data: {"id": sectionID, "title": val},
    success: function (response) {
      $("#newSectionTitleInputContainer").replaceWith('<h3 id="section-title-editor" style="cursor: pointer;" onClick="changeSectionTitle(' + sectionID + ');">' + response.title + '</h3>');
      $("#section-" + sectionID + " a span span").text(response.title);
    },
    fail: function(jqXHR, textStatus, error) {
      // $('#editor-content-container').html(jqXHR.responseText);
    }
  });
};

function addSubSection(id, ancestry, level) {
  $("#modal-parent").val(id);
  $("#modal-parent-ancestry").val(ancestry);
  $("#modal-parent-level").val(level);
};

function expandSection(id) {

};

function setCurrentSection(id) {
  Section.prototype.currentSection = id;
  SectionTreeList.prototype.currentSection = id;
};


/* --------- Section node ------ */
function Section(section) {
  this._id = section.id;
  this._title = section.title;
  this._ancestry = section.ancestry;
  this._level = section.level;
  this._document_id = section.document_id;
  this._parent = null;
  this._children = [];
  this.expandSubTree = true;
  this._edit = true;
};

Section.prototype.setCurrent = function(id, edit) {
  $.ajax({
    url: "/documents/select_section",
    type: "POST",
    data: {"id": id, "edit": edit},
    success: function (response) {
      // let nid = response.section.id;
      // setCurrentSection(response.section.id);
      // $(".active.nav-link-active").removeClass('active nav-link-active').addClass('nav-link-normal');
      // $("#section-" + nid + " a").removeClass('nav-link-normal').addClass('active nav-link-active');
    }
  });
};

Section.prototype.toHTML = function() {
  var li, a, span, rspan, textSpan, i, _curentObj = this;
  var id = this._id, ancestry = this._ancestry, level = this._level;
  // append li
  li = document.createElement('li');
  li.setAttribute("id", "section-" + this._id);
  li.classList.add('nav-item', 'clearfix');

  // append a
  a = document.createElement('a');
  if(Section.prototype.currentSection === this._id) {
    a.classList.add('nav-link', 'active', 'nav-link-active');
  } else {
    a.classList.add('nav-link', 'nav-link-normal');
  }
  a.setAttribute("href", "javascript:;");
  a.style.paddingLeft = this._level === 0 ? "10px" : this._level * 40 + "px";

  if(this._children.length > 0) {
    // append dropdown arrow if children not empty
    span = document.createElement('span');
    span.classList.add("section-arrow");
    i = document.createElement('i');
    if(_curentObj.expandSubTree)
      i.classList.add('fa', 'fa-caret-down');
    else
      i.classList.add('fa', 'fa-caret-right');
    i.setAttribute("aria-hidden", "true");

    span.addEventListener("click", function() {
      _curentObj.expandSubTree = _curentObj.expandSubTree ? false : true;
    });

    span.appendChild(i);
    a.appendChild(span);
  }

  rspan = document.createElement('span');
  textSpan = document.createElement('span');
  textSpan.classList.add("text-title-span");
  textSpan.append(this._title);
  rspan.appendChild(textSpan);

  // append plus icon if in edit mode
  if(this._edit) {
    i = document.createElement('i');
    i.classList.add('align-middle', 'fa', 'fa-plus', 'icon-plus');
    i.setAttribute("aria-hidden", "true");
    i.setAttribute("data-toggle", "modal");
    i.setAttribute("data-target", "#newSectionModal");
    i.style.display = "none";
    i.addEventListener("click", function() {
      addSubSection(id, ancestry, level);
    });
    rspan.appendChild(i);
  }

  rspan.addEventListener("click", function() {
    Section.prototype.setCurrent(id, _curentObj._edit);
  });

  a.appendChild(rspan);
  li.appendChild(a);

  // li.addEventListener("mouseenter", hoverSectionIn(this._id));
  // li.addEventListener("mouseleave", hoverSectionOut(this._id));
  li.addEventListener("mouseenter", function() {
    hoverSectionIn(id);
  });
  li.addEventListener("mouseleave", function() {
    hoverSectionOut(id);
  });

  return li;
}

Section.prototype.render = function(container) {
  var li = this.toHTML(), children, _curentObj = this;
  container.append(li);
  if(_curentObj.expandSubTree) {
    // show sub tree
    children = _curentObj._children;
    for(let i = 0; i < children.length; i++) {
      children[i].render(container);
    }
  }
}



/* --------- Section tree ------ */
function SectionTree() {
  this._root = null;
  this._sectionList = null;
};

SectionTree.prototype.build = function(sections, edit) {
  let root = null;
  // build node hash and find the root node
  var nodes = {};
  for(let i = 0; i < sections.length; i++) {
    let node = new Section(sections[i]);
    node._edit = edit
    nodes[node._id] = node;
    if(node._ancestry == "root") root = node;
  }
  // build tree
  for(let i = 0; i < sections.length; i++) {
    if(sections[i].ancestry != "root") {
      let currentID = sections[i].id;
      let ids = sections[i].ancestry.split("/");
      let parent_id = ids[ids.length - 2];
      nodes[currentID]._parent = nodes[parent_id];
      nodes[parent_id]._children.push(nodes[currentID]);
    }
  }
  this._root = root;
};

SectionTree.prototype.render = function(ul) {
  var root = this._root;
  root.render(ul);
};



/* --------- Section tree list ------ */
function SectionTreeList() {
  this._listContainer = document.getElementById("sectionsListContainer");
  this._treeList = [];
};

SectionTreeList.prototype.currentSection = null;

SectionTreeList.prototype.groupSectionsByRoot = function(sections) {
  // group sections by root => {id: [.,.,.]}
  let sectionGroups = {};
  for(let i = 0; i < sections.length; i++) {
    let kid, section = sections[i];
    if(section.ancestry == "root") {
      kid = section.id;
    } else {
      kid = parseInt(section.ancestry[0]);
    }
    if(!(kid in sectionGroups)) sectionGroups[kid] = [];
    sectionGroups[kid].push(section);
  }
  return sectionGroups;
}

SectionTreeList.prototype.init = function(sections, currentSection, edit) {
  setCurrentSection(currentSection);
  var sectionGroups = this.groupSectionsByRoot(sections);
  for(let group in sectionGroups) {
    if(sectionGroups.hasOwnProperty(group)) {
      let tree = new SectionTree();
      tree.build(sectionGroups[group], edit);
      this._treeList.push(tree);
    }
  }
};

SectionTreeList.prototype.render = function() {
  var i, trees, listContainer, ulElem;
  trees = this._treeList;
  listContainer = this._listContainer;
  listContainer.innerHTML = '';
  ulElem = document.createElement('ul');
  ulElem.setAttribute("id", "sectionsList");
  ulElem.classList.add('nav', 'nav-pills', 'flex-column');
  listContainer.appendChild(ulElem);
  for(i = 0; i < trees.length; i++) {
    trees[i].render(ulElem);
  }
};

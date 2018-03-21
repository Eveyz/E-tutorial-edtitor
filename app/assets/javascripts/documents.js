function hoverSectionIn(id) {
  const sectionLink = "#section-" + id + " a";
  $(sectionLink).children(".icon-plus").show();
}

function hoverSectionOut(id) {
  const sectionLink = "#section-" + id + " a";
  $(sectionLink).children(".icon-plus").hide();
}

function expandSection(id) {

}

function setCurrentSection(id) {
  Section.prototype.currentSection = id;
  SectionTreeList.prototype.currentSection = id;
}


/* --------- Section node ------ */
function Section(section) {
  this._id = section.id;
  this._title = section.title;
  this._ancestry = section.ancestry;
  this._level = section.level;
  this._document_id = section.document_id;
  this._parent = null;
  this._children = [];
};

Section.prototype.setCurrent = function(id) {
  $.ajax({
    url: "/documents/select_section",
    type: "POST",
    data: {"id": id},
    success: function (response) {
      // let nid = response.section.id;
      // setCurrentSection(response.section.id);
      // $(".active.nav-link-active").removeClass('active nav-link-active').addClass('nav-link-normal');
      // $("#section-" + nid + " a").removeClass('nav-link-normal').addClass('active nav-link-active');
    }
  });
};

Section.prototype.render = function(container) {
  var li, a, span, i;
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
    i.classList.add('fa', 'fa-caret-right');
    i.setAttribute("aria-hidden", "true");
    span.appendChild(i);
    a.appendChild(span);
  }

  a.append(this._title);

  // append plus icon
  i = document.createElement('i');
  i.classList.add('align-middle', 'fa', 'fa-plus', 'icon-plus');
  i.setAttribute("aria-hidden", "true");
  i.setAttribute("data-toggle", "modal");
  i.setAttribute("data-target", "#newSectionModal");
  i.style.display = "none";
  a.appendChild(i);

  li.appendChild(a);

  var id = this._id;
  // li.addEventListener("mouseenter", hoverSectionIn(this._id));
  // li.addEventListener("mouseleave", hoverSectionOut(this._id));
  li.addEventListener("click", function() {
    Section.prototype.setCurrent(id);
  });
  li.addEventListener("mouseenter", function() {
    hoverSectionIn(id);
  });
  li.addEventListener("mouseleave", function() {
    hoverSectionOut(id);
  });

  container.append(li);

  // render sub tree
  if(this._children.length > 0) {
    for(let c = 0; c < this._children.length; c++) {
      this._children[c].render(container);
    }
  }
}



/* --------- Section tree ------ */
function SectionTree() {
  this._root = null;
  this._sectionList = null;
};

SectionTree.prototype.build = function(sections) {
  let root = null;
  // build node hash and find the root node
  var nodes = {};
  for(let i = 0; i < sections.length; i++) {
    let node = new Section(sections[i]);
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

SectionTree.prototype.addNode = function() {

};

SectionTree.prototype.changeNodeTitle = function(title) {

};

SectionTree.prototype.deleteNode = function() {

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

SectionTreeList.prototype.init = function(sections, currentSection) {
  setCurrentSection(currentSection);
  var sectionGroups = this.groupSectionsByRoot(sections);
  for(let group in sectionGroups) {
    if(sectionGroups.hasOwnProperty(group)) {
      let tree = new SectionTree();
      tree.build(sectionGroups[group]);
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

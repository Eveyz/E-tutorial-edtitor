function hoverSectionIn(id) {
  const sectionLink = "#" + id + " a";
  $(sectionLink).children(".icon-plus").show();
}

function hoverSectionOut(id) {
  const sectionLink = "#" + id + " a";
  $(sectionLink).children(".icon-plus").hide();;
}

function expandSection(id) {

}



/* --------- Section node ------ */
function Section(section) {
  this._id = section.id;
  this._ancestry = section.ancestry;
  this._level = section.level;
  this._document_id = section.document_id;
  this._parent = null;
  this._children = [];
};




/* --------- Section tree ------ */
function SectionTree() {
  this._root = null;
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




/* --------- Section tree list ------ */
function SectionTreeList() {
  this.listEle = document.getElementById("sectionsList");
  this.treeList = [];
};

SectionTreeList.prototype.groupSectionsByRoot = function(sections) {
  // group sections by root => {id: []}
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

SectionTreeList.prototype.init = function(sections) {
  var sectionGroups = this.groupSectionsByRoot(sections);
  for(var group in sectionGroups) {
    if(sectionGroups.hasOwnProperty(group)) {
      let tree = new SectionTree();
      tree.build(sectionGroups[group]);
      this.treeList.push(tree);
    }
  }
};

SectionTreeList.prototype.render = function() {
  
};


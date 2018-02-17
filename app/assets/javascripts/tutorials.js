function hoverSectionIn(id) {
  const sectionLink = "#" + id + " a";
  $(sectionLink).children("i").show();
}

function hoverSectionOut(id) {
  const sectionLink = "#" + id + " a";
  $(sectionLink).children("i").hide();;
}
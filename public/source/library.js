/*  Author: Tim Schofield

    Modile for managing library functions
*/

var library = (function() {
  var $library      = $(),
      $nav          = $(),
      $scrollButton = $(),
      scrollYStart  = 0,
      scrollHeight  = 0,
      rowHeight     = 0,
      scrollStep    = 1;

  var MIN_ROWS      = 8,
      NAV           = "#lib-nav",
      NAV_PATH1     = "#nav-path1",
      NAV_PATH2     = "#nav-path2",
      NAV_PATH3     = "#nav-path3",
      CLICKABLE     = ".clickable-cell"
      BLANK         = ".empty",
      BLANK_ROW     = "<tr class=\"empty\"><td/></tr>",
      ACTIVE        = ":not(" + BLANK + ")",
      ACTIVE_ROW    = "tr" + ACTIVE;

  // ---------------
  // Setup Functions
  // ---------------

  function setLibrary($libraryNode) {
    $library = $libraryNode;
    $nav = $(NAV);
  }

  function setScrollbar($scrollButtonNode) {
    $scrollButton = $scrollButtonNode;

    // get scrollbar geometry
    scrollYStart = $scrollButton.parent().offset().top;
    scrollHeight = $scrollButton.parent().height() - $scrollButton.height();
    rowHeight = $library.children().first().height();
    scrollStep = scrollHeight;
  }

  function enable() {
    $nav.on("click", CLICKABLE, listArtistsByLetter);
  }

  // --------------
  // Event Handlers
  // --------------

  function listArtistsByLetter(e) {
    var letter = $(this).text();
    setNavPath(1, letter);
    $.get(
      "getartists",
      { "first_letter" : letter },
      function(artists) {
        display(artists);
        $library.on("click", ACTIVE_ROW, listAlbumsByArtist);
      },
      "json");
  }

  function listAlbumsByArtist(e) {
    var artist = $(this).children("td").text();
    $library.off("click", ACTIVE_ROW);
    setNavPath(2, artist);
    $.get(
      "getalbumsbyartist",
      { "artist" : artist },
      function(albums) {
        display(albums);
        $library.on("click", ACTIVE_ROW, listSongsByAlbum);
      },
      "json");
  }

  function listSongsByAlbum(e) {

  }

  // -------------
  // GUI Functions
  // -------------
  
  function setNavPath(position, text) {
    if (position === 1) {
      $(NAV_PATH1, $nav).text(text);
      $(NAV_PATH1, $nav).siblings().css("display", "none");
    } else if (position === 2) {
      $(NAV_PATH2, $nav).prev().removeAttr("style");
      $(NAV_PATH2, $nav).text(text);
      $(NAV_PATH2, $nav).removeAttr("style");
    } else {

    }
  }

  function display(items) {
    var length    = items.length;
        index     = 0;

    $library.children().remove();
    for (index = length; index--; ) {
      $library.append("<tr><td>" + items[index] + "<td/><tr/>");
    }
    for (index = MIN_ROWS - length; index >= 0; index --) {
      $library.append(BLANK_ROW);
    }
  }

  return {
    setLibrary:     setLibrary,
    setScrollbar:   setScrollbar,
    enable:         enable
  }
})();

function initLibrary() {
  library.setLibrary($("#library"));
  library.setScrollbar($("#lib-scrollbar .indicator"));
  library.enable();
}

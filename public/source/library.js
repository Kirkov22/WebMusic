/*  Author: Tim Schofield

    Modile for managing library functions
*/

var library = (function() {
  var $library      = $(),
      $nav          = $(),
      $add          = $(),
      $scrollButton = $(),
      scrollYStart  = 0,
      scrollHeight  = 0,
      rowHeight     = 0,
      scrollStep    = 1,
      selected      = [];

  var MIN_ROWS      = 8,
      NAV           = "#lib-nav",
      ADD           = "#add-song",
      NAV_PATH1     = "#nav-path1",
      NAV_PATH2     = "#nav-path2",
      NAV_PATH3     = "#nav-path3",
      CLICKABLE     = ".clickable-cell",
      SELECT_CLASS  = "selected",
      TRACK_ID      = "songID",
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

    // Hide nav path
    $(NAV_PATH1, $nav).siblings().andSelf().css("display", "none");
  }

  function setScrollbar($scrollButtonNode) {
    $scrollButton = $scrollButtonNode;

    // get scrollbar geometry
    scrollYStart = $scrollButton.parent().offset().top;
    scrollHeight = $scrollButton.parent().height() - $scrollButton.height();
    rowHeight = $library.children().first().height();
    scrollStep = scrollHeight;
    
    // hide scrollbutton until needed
    $scrollButton.css("display", "none");
  }

  function enable() {
    $nav.on("click", CLICKABLE + ":not(" + ADD + ")", listArtistsByLetter);
    $(ADD).on("click", addSongs);
  }

  // --------------
  // Event Handlers
  // --------------

  function listArtistsByLetter(e) {
    var letter = $(this).text();
    setNavPath(1, letter);
    selected = [];
    $.get(
      "getartists",
      { "first_letter" : letter },
      function(artists) {
        display(artists);
        $library.on("click", ACTIVE_ROW, listAlbumsByArtist);
      },
      "json");

    //Stop Propagation/Default Action
    return false;
  }

  function listAlbumsByArtist(e) {
    var artist = $(this).children("td").text();
    $library.off("click", ACTIVE_ROW);
    setNavPath(2, artist);
    selected = [];
    $.get(
      "getalbumsbyartist",
      { "artist" : artist },
      function(albums) {
        display(albums);
        $library.on("click", ACTIVE_ROW, listSongsByAlbum);
      },
      "json");

    //Stop Propagation/Default Action
    return false;
  }

  function listSongsByAlbum(e) {
    var album = $(this).children("td").text();
    $library.off("click", ACTIVE_ROW);
    setNavPath(3, album);
    selected = [];
    $.get(
      "getsongsbyalbum",
      { "album" : album },
      function(songs) {
        displaySongs(songs);
        $library.on("click", ACTIVE_ROW, select);
      },
      "json");

    //Stop Propagation/Default Action
    return false;
  }

  function select(e) {
    var $select = $(this);
    var id = $("span", $select).attr(TRACK_ID);
    var index = selected.indexOf(id);

    if ( index === -1) {
      // If not already selected, add to selected
      selected.push(id);
      $select.addClass(SELECT_CLASS);
    } else {
      // De-select if already selected
      selected.splice(index, 1);
      $select.removeClass(SELECT_CLASS);
    }

    //Stop Propagation/Default Action
    return false;
  }
  
  function addSongs(e) {
    var length = selected.length;
    var id = -1;
    for (var i = length; i--; ) {
      id = selected.shift();
      addSong(id);
    }
    $("tr", $library).removeClass(SELECT_CLASS);
  }

  function addSong(id) {
    $.get(
      "getsonginfo",
      { "id" : id },
      function(song) {
        var $tr = $(
          "<tr><td>" + song["artist"] + "</td>" +
              "<td>" + song["album"] + "</td>" +
              "<td>" + song["track"] + "</td>" +
              "<td>" + song["title"] + "</td></tr>");
        $tr.attr(TRACK_ID, id);
        playlist.add($tr);
      },
      "json");
  }

  function scrollStart(e) {
    // Get Mouse Y position relative to button's top edge
    var offset = e.pageY - $scrollButton.offset().top;

    $scrollButton.on("mouseup", upHandler);
    $scrollButton.on("mousemove", moveHandler);
    e.target.setCapture();

    function moveHandler(e) {
      var position = e.pageY - offset - scrollYStart;
      if (position < 0) {
        position = 0; 
      } else if (position > scrollHeight) {
        position = scrollHeight;
      }
      scroll(position);

      //Stop Propagation/Default Action
      return false;
    }

    function upHandler(e) {
      $scrollButton.off("mousemove", moveHandler);
      $scrollButton.off("mouseup", upHandler);

      //Stop Propagation/Default Action
      return false;
    }

    // Stop Propagation/Default Action
    return false;
  }

  // -------------
  // GUI Functions
  // -------------
  
  function setNavPath(position, text) {
    if (position === 1) {
      $(NAV_PATH1, $nav).text(text);
      $(NAV_PATH1, $nav).css("display", "");
      $(NAV_PATH1, $nav).siblings().css("display", "none");
    } else if (position === 2) {
      $(NAV_PATH2, $nav).prev().css("display", "");
      $(NAV_PATH2, $nav).text(text);
      $(NAV_PATH2, $nav).css("display", "");
    } else {
      $(NAV_PATH3, $nav).prev().css("display", "");
      $(NAV_PATH3, $nav).text(text);
      $(NAV_PATH3, $nav).css("display", "");
    }
  }

  function display(items) {
    var length    = items.length;
        index     = 0;

    $library.children().remove();
    for (index = 0; index < length; index++) {
      $library.append("<tr><td>" + items[index] + "</td></tr>");
    }
    if (length <= MIN_ROWS) {
      for (index = MIN_ROWS - length; index >= 0; index --) {
        $library.append(BLANK_ROW);
      }
      $scrollButton.css("display", "none");
      $scrollButton.off("mousedown");
    } else {
      $scrollButton.css("display", "");
      scrollStep  = scrollHeight / (length - MIN_ROWS);
      $scrollButton.on("mousedown", scrollStart);
    }
  }

  function displaySongs(songs) {
    var id      = -1,
        title   = "",
        items   = [],
        length  = songs.length,
        index   = 0,
        song;

    for (index = 0; index < length; index++) {
      song = songs[index];
      id = song["id"] || -1;
      title = pad(song["track"], 2) + " - " + song["title"];
      items.push("<span " + TRACK_ID + "=" + id + ">" + title + "</span>");
    }
    display(items);
  }

  function scroll(position) {
    var steps = Math.round(position / scrollStep);
    libraryScrollPosition(steps);
    scrollButtonPosition(steps);
  }

  function scrollButtonPosition(steps) {
    if (steps > 0)
      $scrollButton.css("top", (steps * scrollStep) + "px");
    else
      $scrollButton.css("top", "0px");
  }

  function libraryScrollPosition(steps) {
    if (steps > 0)
      $library.parent().css("top", "-" + (steps * rowHeight) + "px");
    else
      $library.parent().css("top", "0px");
  }

//   function initDisplays() {
//     $scrollButton.css("display", "none");
//     $(NAV_PATH1, $nav).siblings().andSelf().css("display", "none");
//   }

  // -------------
  // Other Helpers
  // -------------

  function pad(num, digits) {
    var s = num.toString();
    while (s.length < digits) s = "0" + s;
    return s;
  }

  return {
    setLibrary:     setLibrary,
    setScrollbar:   setScrollbar,
    enable:         enable,
  }
})();

function initLibrary() {
  library.setLibrary($("#library"));
  library.setScrollbar($("#lib-scrollbar .indicator"));
  library.enable();
}

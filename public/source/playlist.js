var playlist = (function() {
  var $playlist     = null,
      $scrollButton = null,
      scrollYStart  = 0,
      scrollHeight  = 0,
      rowHeight     = 0,
      scrollStep    = 1,
      selected      = [],
      length        = 0,
      $prev         = $(),
      prevPath      = "",
      $current      = $(),
      currentPath   = "",
      $next         = $(),
      nextPath      = "";

  var MIN_ROWS      = 8,
      REMOVE        = "#trash",
      SHUFFLE       = "#shuffle",
      BLANK         = ".empty",
      BLANK_ROW     = "<tr class=\"empty\"><td/><td/><td/><td/></tr>",
      ACTIVE        = ":not(" + BLANK + ")";
      ACTIVE_ROW    = "tr" + ACTIVE;

  // ---------------
  // Setup Functions
  // ---------------

  function setPlaylist($playlistNode) {
    $playlist = $playlistNode;
  }

  function setScrollbar($scrollButtonNode) {
    $scrollButton = $scrollButtonNode;

    // get scrollbar geometry
    scrollYStart = $scrollButton.parent().offset().top;
    scrollHeight = $scrollButton.parent().height() - $scrollButton.height();
    rowHeight = $("tr:first", $playlist).height();
    scrollStep = scrollHeight;
  }
  
  function enable() {
    $playlist.on("dblclick", ACTIVE_ROW, changeCurrent);
    $playlist.on("click", ACTIVE_ROW, select);
    $(REMOVE).on("click", removeSelected);
    $(SHUFFLE).on("click", shufflePlaylist);
  }

  // --------------
  // Event Handlers
  // --------------

  function changeCurrent(e) {
    // Deselect other rows and move the current class to the dbl clicked song
    emptySelected();
    $current = $(this);
    setCurrentClass();

    var id = $current.attr("songID");
    loadCurrent(id);
  }

  function select(e) {
    var $select = $(this);
    var id = $select.attr("songID");
    var index = selected.indexOf(id);

    if ( index === -1) {
      // If not already selected, add to selected
      selected.push(id);
      $select.addClass("selected");
    } else {
      // De-select if already selected
      selected.splice(index, 1);
      $select.removeClass("selected");
    }
  }

  function removeSelected(e) {
    var numRemoved = selected.length;
    for (var i = numRemoved; i--; ) {
      removeSong(selected[i]);
    }
    selected = [];
    preparePrev();
    prepareNext();
  }

  function shufflePlaylist(e) {
    var $songs  = $playlist.children(ACTIVE_ROW).clone(),
        $blanks = $playlist.children(BLANK).clone();
    shuffle($songs);
    $playlist.html($songs);
    $playlist.append($blanks);
    reacquireCurrent();
    preparePrev();
    prepareNext();
  }

  function scrollStart(e) {
    // Get Mouse Y position relative to button's top edge
    var offset = e.pageY - $scrollButton.offset().top;

    document.addEventListener("mouseup", upHandler, true);
    document.addEventListener("mousemove", moveHandler, true);

    function moveHandler(e) {
      var position = e.pageY - offset - scrollYStart;
      if (position < 0) {
        position = 0; 
      } else if (position > scrollHeight) {
        position = scrollHeight;
      }
      scroll(position);
      e.stopPropagation();
    }

    function upHandler(e) {
      document.removeEventListener("mousemove", moveHandler, true);
      document.removeEventListener("mouseup", upHandler, true);
      e.stopPropagation();
    }

    // Stop Propagation/Default Action
    return false;
  }

  // -------------------
  // UI Helper Functions
  // -------------------

  function setCurrentClass() {
    $current.siblings().removeClass("current");
    $current.addClass("current");
  }

  function emptySelected() {
    $("tr", $playlist).removeClass("selected");
    selected = [];
  }

  function removeSong(id) {
    var $song = $("[songID=" + id + "]", $playlist);
    if ($song.is($current))
      next();
    $("[songID=" + id + "]" , $playlist).remove();
    decrementPL();
  }

  // Adjust GUI for the removal of 1 playlist entry
  function decrementPL() {
    length -= 1;
    if (length === MIN_ROWS) {
      disableScroll();
    }else if (length < MIN_ROWS) {
      $playlist.append(BLANK_ROW);
    } else {
      decrementScrollStep();
    }
  }

  // Adjust GUI for the addition of 1 playlist entry
  function incrementPL() {
    length += 1;
    if (length === MIN_ROWS + 1) {
      enableScroll();
    }else if (length <= MIN_ROWS) {
      removeBlankRow();
    } else {
      incrementScrollStep();
    }
  }

  function removeBlankRow() {
    $(BLANK, $playlist).first().remove();
  }

  function shuffle($array) {
    var randIndex,
        temp,
        index;

    for ( index = $array.length; index--; ) {
      randIndex = Math.floor(Math.random() * index);
      temp = $array[index];
      $array[index] = $array[randIndex];
      $array[randIndex] = temp;
    }
  }

  function scrollButtonPosition(steps) {
    $scrollButton.css("top", (steps * scrollStep) + "px");
  }

  function playlistScrollPosition(steps) {
    $playlist.parent().css("top", "-" + (steps * rowHeight) + "px");
  }

  function displaySongData($tr) {
    //Get song data from table row
    var id = $tr.attr("songID");
    var artist = $("td:nth-of-type(1)", $tr).text();
    var title = $("td:nth-of-type(4)", $tr).text();
    var track = $("td:nth-of-type(3)", $tr).text();
    var album = $("td:nth-of-type(2)", $tr).text();

    // Display new song
    trackData.newSong(id, artist, title, track, album);
  }

  // -------------
  // Other Helpers
  // -------------

  function loadCurrent(id) {
    displaySongData($current);
    trackData.setStatus("Loading");
    $.get("music",
      { songID: id },
      onCurrentLoad,
      "text");
  }

  function onCurrentLoad(path) {
    player.setSrc(path);
    trackData.stop();
    preparePrev();
    prepareNext();
  }

  function preparePrev() {
    prevPath  = "";
    $prev     = $current.prev(ACTIVE);

    //TODO Add support for continuous play
    if (false && $prev.length === 0)
      $prev = $("tr[songID]:last", $playlist);
    if ($prev.length !== 0)
      $.get("music",
        { songID: $prev.attr("songID") },
        function(path) {
          prevPath = path;
        },
        "text");
  }

  function prepareNext() {
    nextPath  = "";
    $next     = $current.next(ACTIVE);

    //TODO Add support for continuous play
    if (false && $next.length === 0)
      $next = $("tr[songID]:first", $playlist);
    if ($next.length !== 0)
      $.get("music",
        { songID: $next.attr("songID") },
        function(path) {
          nextPath = path;
        },
        "text");
  }

  function reacquireCurrent() {
    $current = $playlist.children(".current");
  }

  function disableScroll() {
    $scrollButton.off("mousedown", scrollStart);
    $scrollButton.removeAttr("style");
    $playlist.parent().removeAttr("style");
  }

  function enableScroll() {
    $scrollButton.on("mousedown", scrollStart);
    $scrollButton.css("display", "initial");
  }

  function decrementScrollStep() {
    // Keep minimum number of rows visible
    if (length > MIN_ROWS) {
      var cssTop  = $scrollButton.css("top") || "0";
      var intTop  = parseInt(cssTop);
      var steps   = intTop / scrollStep;
      updateScrollStep();
      scrollButtonPosition(steps - 1);
      playlistScrollPosition(steps - 1);
    }
  }

  function incrementScrollStep() {
    //Keep minimum # of rows visible
    if (length > MIN_ROWS) {
      var cssTop  = $scrollButton.css("top") || "0";
      var intTop  = parseInt(cssTop);
      var steps   = intTop / scrollStep;
      updateScrollStep();
      scrollButtonPosition(steps);
    } 
  }
  
  function updateScrollStep() {
    scrollStep  = scrollHeight / (length - MIN_ROWS);
  }

  function scroll(position) {
    var steps = Math.round(position / scrollStep);
    playlistScrollPosition(steps);
    scrollButtonPosition(steps);
  }

  //-------------------------------
  // External Playlist Manipulation
  //-------------------------------

  function add($tr) {
    emptySelected();
    var idToAdd = $tr.attr("songID");
    // If song isn't already in the playlist
    if ($("tr[songID=\"" + idToAdd + "\"]", $playlist).length === 0) {
      if (length >= MIN_ROWS) {
        $playlist.append($tr.clone());
      } else if (length > 0) {
        $("tr.empty:first", $playlist).before($tr.clone());
        prepareNext();
      } else {
        $current = $tr.clone();
        $("tr.empty:first", $playlist).before($current);
        setCurrentClass();
        loadCurrent(idToAdd);
      }
    incrementPL();
    }
  }

  function next() {
    if (nextPath === "") {
      if ($next.length === 0) {
        player.pause();
        player.setToEnd();
      } else {
        $current = $next;
        setCurrentClass();
        loadCurrent($current.attr("songID"));
      }
    } else {
      $prev         = $current;
      prevPath      = currentPath;
      $current      = $next;
      currentPath   = nextPath;
      setCurrentClass();
      player.setSrc(currentPath);
      displaySongData($current);
      trackData.stop();
      prepareNext();
    }
  }

  function prev() {
    if (prevPath === "") {
      if ($prev.length === 0) {
        player.pause();
        player.setCurrentTime(0);
      } else {
        $current = $prev;
        setCurrentClass();
        loadCurrent($current.attr("songID"));
      }
    } else {
      $next         = $current;
      nextPath      = currentPath;
      $current      = $prev;
      currentPath   = prevPath;
      setCurrentClass();
      player.setSrc(currentPath);
      displaySongData($current);
      trackData.stop();
      preparePrev();
    }
  }

  return {
    setPlaylist:  setPlaylist,
    setScrollbar: setScrollbar,
    enable:       enable,
    prepareNext:  prepareNext,
    add:          add,
    next:         next,
    prev:         prev
  };
})();

function initPlaylist() {
  playlist.setPlaylist($("#playlist"));
  playlist.setScrollbar($("#pl-scrollbar .indicator"));
  playlist.enable();
}

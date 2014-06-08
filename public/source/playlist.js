/*  Author: Tim Schofield

    Module for managing playlist functions
*/

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
      GETSONG_URL   = "music"
      CURRENT_CLASS = "current",
      SELECT_CLASS  = "selected",
      REMOVE        = "#trash",
      SHUFFLE       = "#shuffle",
      TRACK_ID      = "songID",
      TRACK_ID_ATTR = "[" + TRACK_ID + "]",
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
    rowHeight = $playlist.children().first().height();
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

    var id = $current.attr(TRACK_ID);
    loadCurrent(id);

    //Stop Propagation/Default Action
    return false;
  }

  function select(e) {
    var $select = $(this);
    var id = $select.attr(TRACK_ID);
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

  function removeSelected(e) {
    var numRemoved = selected.length;
    for (var i = numRemoved; i--; ) {
      removeSong(selected[i]);
    }
    selected = [];
    evaluatePrevNext();

    //Stop Propagation/Default Action
    return false;
  }

  function shufflePlaylist(e) {
    var $songs  = $playlist.children(ACTIVE).clone(),
        $blanks = $playlist.children(BLANK).clone();
    if ($songs.length > 1) {
      shuffle($songs);
      $playlist.html($songs);
      $playlist.append($blanks);
      reacquireCurrent();
      evaluatePrevNext();
    }

    //Stop Propagation/Default Action
    return false;
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

  // -------------------
  // UI Helper Functions
  // -------------------

  function setCurrentClass() {
    $current.siblings().removeClass(CURRENT_CLASS);
    $current.addClass(CURRENT_CLASS);
  }

  function emptySelected() {
    $playlist.children().removeClass(SELECT_CLASS);
    selected = [];
  }

  function removeSong(id) {
    var $song = $playlist.children(trackIDAttr(id));
    if ($song.is($current))
      next();
    $song.remove();
    decrementPL();
  }

  // Adjust GUI for the removal of 1 playlist entry
  function decrementPL() {
    length -= 1;
    if (length === MIN_ROWS) {
      disableScroll();
    } else if (length < MIN_ROWS) {
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
    $playlist.children(BLANK).first().remove();
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
    if (steps > 0)
      $scrollButton.css("top", (steps * scrollStep) + "px");
    else
      $scrollButton.css("top", "0px");
  }

  function playlistScrollPosition(steps) {
    if (steps > 0)
      $playlist.parent().css("top", "-" + (steps * rowHeight) + "px");
    else
      $playlist.parent().css("top", "0px");
  }

  function displaySongData($tr) {
    //Get song data from table row
    var id      = $tr.attr(TRACK_ID),
        artist  = $tr.children().eq(0).text(),
        title   = $tr.children().eq(3).text(),
        track   = $tr.children().eq(2).text(),
        album   = $tr.children().eq(1).text();

    // Display new song
    trackData.newSong(id, artist, title, track, album);
  }

  // -------------
  // Other Helpers
  // -------------

  function loadCurrent(id) {
    displaySongData($current);
    trackData.setStatus("Loading");
    $.get(GETSONG_URL,
      { songID: id },
      onCurrentLoad,
      "text");
  }

  function onCurrentLoad(path) {
    player.setSrc(path);
    trackData.stop();
    evaluatePrevNext();
  }

  function preparePrev() {
    prevPath  = "";
    $prev     = $current.prev(ACTIVE);

    if (continuousButton.isActive() && $prev.length === 0)
      $prev = $playlist.children(TRACK_ID_ATTR).last();
    if ($prev.length !== 0)
      $.get(GETSONG_URL,
        { songID: $prev.attr(TRACK_ID) },
        function(path) {
          prevPath = path;
        },
        "text");
  }

  function prepareNext() {
    nextPath  = "";
    $next     = $current.next(ACTIVE);

    if (continuousButton.isActive() && $next.length === 0)
      $next = $playlist.children(TRACK_ID_ATTR).first();
    if ($next.length !== 0)
      $.get(GETSONG_URL,
        { songID: $next.attr(TRACK_ID) },
        function(path) {
          nextPath = path;
        },
        "text");
  }

  function reacquireCurrent() {
    $current = $playlist.children("." + CURRENT_CLASS);
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

  function trackIDAttr(id) {
    return "[" + TRACK_ID + "=\"" + id + "\"]";
  }

  function evaluatePrevNext() {
    preparePrev();
    prepareNext();
  }

  //-------------------------------
  // External Playlist Manipulation
  //-------------------------------

  function add($tr) {
    emptySelected();
    var idToAdd = $tr.attr(TRACK_ID);
    // If song isn't already in the playlist
    if ($playlist.children(trackIDAttr(idToAdd)).length === 0) {
      if (length >= MIN_ROWS) {
        $playlist.append($tr.clone());
        evaluatePrevNext();
      } else if (length > 0) {
        $playlist.children(BLANK).first().before($tr.clone());
        evaluatePrevNext();
      } else {
        $current = $tr.clone();
        $playlist.children(BLANK).first().before($current);
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
        loadCurrent($current.attr(TRACK_ID));
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
        loadCurrent($current.attr(TRACK_ID));
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
    setPlaylist:      setPlaylist,
    setScrollbar:     setScrollbar,
    enable:           enable,
    evaluatePrevNext: evaluatePrevNext,
    add:              add,
    next:             next,
    prev:             prev
  };
})();

function initPlaylist() {
  playlist.setPlaylist($("#playlist"));
  playlist.setScrollbar($("#pl-scrollbar .indicator"));
  playlist.enable();
}

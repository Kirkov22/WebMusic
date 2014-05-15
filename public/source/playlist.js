var playlist = (function() {
  var $playlist     = null,
      $selected     = [],
      current       = 0,
      nextID        = 0,
      nextPath      = "";

  function setPlaylist($playlistNode) {
    $playlist = $playlistNode;
  }

  function add($tr) {
    $playlist.append($tr);
  }

  function enable() {
    $playlist.on("dblclick", "tr", setCurrent);
  }

  function setCurrent(e) {
    $selected = [$(this)];
    $selected[0].siblings().removeClass("selected");
    $selected[0].siblings().removeClass("current");
    $selected[0].addClass("current");
    var id = $selected[0].attr("songID");
    var artist = $("td:nth-of-type(1)", $selected[0]).text();
    var title = $("td:nth-of-type(4)", $selected[0]).text();
    var track = $("td:nth-of-type(3)", $selected[0]).text();
    var album = $("td:nth-of-type(2)", $selected[0]).text();
    current = id;
    trackData.newSong(id, artist, title, track, album);
    $.get("music",
      { songID: id },
      function(path) {
        $("audio").attr("src", path);
        trackData.stop();
        prepareNext();
      },
      "text");
  }

  function next() {
    current = nextID;
    trackData.newSong(nextID);
    $(audio).attr("src", nextPath);
    trackData.stop();
    prepareNext();
  }

  function prepareNext() {
    nextID = 0;
    nextPath = "";
    var nextSong = $("[songID='" + current + "'] + tr", $playlist);
    if(nextSong.length > 0) {
      nextID = nextSong.attr("songID");
      $.get("music",
        { songID: nextID },
        function(path) {
          nextPath = path;
        },
        "text");
    }
  }

  function nextReady() {
    return (nextPath !== "");
  }

  return {
    setPlaylist:  setPlaylist,
    enable:       enable,
    prepareNext:  prepareNext,
    next:         next,
    nextReady:    nextReady
  };
})();

function initPlaylist() {
  playlist.setPlaylist($("#playlist"));
  playlist.enable();
}

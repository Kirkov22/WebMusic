/*  Author: Tim Schofield
  
    Modules for the audio player controls
*/

// Audio node
var audio = null;

// Control audio volume through a knob
var volumeKnob = (function () {

  var $knob         = null,
      $indicator    = null,
      enabled       = false,
      knobCenterX   = 0,
      knobCenterY   = 0,
      lastQuadrant  = 0,
      opposite      = 0,
      adjacent      = 0;
  
  function setKnob($knobNode) {
    $knob         = $knobNode;
    $indicator    = $(".indicator", $knob);
    knobCenterX   = $knob.offset().left + ($knob.innerWidth() / 2);
    knobCenterY   = $knob.offset().top + ($knob.innerHeight() / 2);
  }

  function enable() {
    if ($knob === null) {
      throw new Error("(volumeKnob) uninitialized $knob var");
    } else if (audio === null) {
      throw new Error("(volumeKnob) uninitialized audio var");
    } if (!enabled) {
      $knob.on("mousedown", adjustVolume);
      enabled = true;
    }
  }

  function disable() {
    $knob.off("mousedown", adjustVolume);
    enabled = false;
  }

  function adjustVolume(e) {
    document.addEventListener("mouseup", upHandler, true);
    document.addEventListener("mousemove", moveHandler, true);

    // Stop Propagation/Default Action
    return false;
  }

  function upHandler(e) {
    document.removeEventListener("mousemove", moveHandler, true);
    document.removeEventListener("mouseup", upHandler, true);
    e.stopPropagation();
  }

  function moveHandler(e) {
    var theta = mouseAngle(e); 
    setByAngle(theta);
    e.stopPropagation();
  }

  function mouseAngle(moveEvent) {
    var deltaX = moveEvent.pageX - knobCenterX;
    var deltaY = moveEvent.pageY - knobCenterY;
    var theta = 0;

    // Move in Quadrant 1
    if (deltaY > 0 && deltaX <= 0) {

      if (lastQuadrant === 4) {
        // Stop movement from Quad 4 to 1
        opposite = 0;
        theta = 359;
        $knob.addClass("high-volume");
      } else {
        opposite = deltaX;
        theta = 0;
        lastQuadrant = 1;
      }
      adjacent = -deltaY;

    // Move in Quadrant 2
    } else if (deltaY <= 0 && deltaX < 0) {
      opposite = deltaY;
      adjacent = deltaX;
      theta = 90;
      lastQuadrant = 2;

    // Move in Quadrant 3
    } else if (deltaY < 0 && deltaX >= 0) {
      opposite = -deltaX;
      adjacent = deltaY;
      theta = 180;
      lastQuadrant = 3;

    // Move in Quadrant 4
    } else if (deltaY >= 0 && deltaX > 0) {
      if (lastQuadrant === 1) {
        // Stop movement from Quad 1 to Quad 4
        opposite = 0;
        theta = 0;
      } else {
        opposite = -deltaY;
        theta = 270;
        lastQuadrant = 4;
      }
      adjacent = -deltaX;
    }

    // Calculate angle to mouse pointer
    return theta + Math.atan(opposite / adjacent) / Math.PI * 180;
  }

  function setByAngle(theta) {
    spinKnob(theta);
    audio.volume = (theta / 360);
  }
  
  // Set the indicator to the correct angle and update the class
  function spinKnob(theta) {
    $knob.removeClass();
    if (theta === 0) {
      $knob.addClass("mute");
    } else if (theta < 90) {
      $knob.addClass("soft-volume");
    } else if (theta < 180) {
      $knob.addClass("low-volume");
    } else if (theta < 270) {
      $knob.addClass("mid-volume");
    } else {
      $knob.addClass("high-volume");
    }
    $indicator.css("transform", "rotate(" + theta + "deg)");
  }

  function setByPercent(percent) {
    spinKnob(percent * 3.6);
    audio.volume = percent;
  }

  // Public methods
  return {
    setKnob:        setKnob,
    enable:         enable,
    disable:        disable,
    setByPercent:   setByPercent
  };
})();

// Display and control progress through a progress bar
var progressBar = (function() {

  var $bumper       = null,
      $progressBG   = null,
      enabled       = false,
      halfWidth     = 0,
      pageOffset    = 0,
      leftBound     = 0,
      rightBound    = 0;

  function setBumper($bumperNode) {
    $bumper       = $bumperNode;
    $progressBG   = $bumper.siblings(".progress-bg");
    halfWidth     = Math.floor($bumper.width() / 2);
    pageOffset    = $bumper.parent().offset().left;
    leftBound     = pageOffset + halfWidth;
    rightBound    = pageOffset + $bumper.parent().width() - $bumper.width();
  }

  function enable() {
    if ($bumper === null) {
      throw new Error("(progressBar) uninitialized $bumper var");
    } else if (audio === null) {
      throw new Error("(progressBar) uninitialized audio var");
    } else if (!enabled) {
      $bumper.on("mousedown", seek);
      $(audio).on("timeupdate", updateTime);
      enabled = true;
    }
  }

  function disable() {
    $bumper.off("mousedown", seek);
    $(audio).off("timeupdate", updateTime);
    enabled = false;
  }

  function seek(e) {
    $(audio).off("timeupdate", updateTime);
    document.addEventListener("mouseup", upHandler, true);
    document.addEventListener("mousemove", moveHandler, true);
    
    // Stop Propagation/Default Action
    return false;
  }

  function upHandler(e) {
    document.removeEventListener("mousemove", moveHandler, true);
    document.removeEventListener("mouseup", upHandler, true);
    audio.currentTime = positionToTime();
    $(audio).on("timeupdate", updateTime);
    e.stopPropagation();
  }

  function positionToTime() {
    var percent = parseInt($bumper.css("left"), 10) /
      ($bumper.parent().width() - $bumper.width());
    var songLength = audio.duration;
    return percent * songLength;
  }

  function moveHandler(e) {
    var position = 0;
    if (e.pageX < leftBound) {
      position = 0;
    } else if (e.pageX > rightBound + halfWidth) {
      position = rightBound - pageOffset;
    } else {
      position = e.pageX - halfWidth - pageOffset;
    }
    setPosition(position);
    e.stopPropagation();
  }

  function setPosition(position) {
    $bumper.css("left", (position - 1) + "px");
    $progressBG.css("width", (position + halfWidth) + "px");
  }

  function updateTime() {
    var width = rightBound - pageOffset;
    var position = audio.currentTime * width / audio.duration;
    setPosition(position);

    // Stop Propagation/Default Action
    return false;
  }

  // Public Methods
  return {
    setBumper:    setBumper,
    enable:       enable,
    disable:      disable,
    setPosition:  setPosition
  };
})();

// Toggle audio player's play/pause state
var playPause = (function() {

  var $button = null,
      enabled = false;

  function setButton($buttonNode) {
    $button = $buttonNode; 
  }

  function enable() {
    if ($button === null) {
      throw new Error("(playPause) uninitialized $button var");
    } else if (audio === null) {
      throw new Error("(playPause) uninitialized $button var");
    } if (!enabled) {
      $button.on("click", buttonPress);
      enabled = true;
    }
  }

  function disable() {
    $button.off("click", buttonPress);
  }

  function buttonPress() {
    if (audio.paused) {
      audio.play();
      $(audio).attr("autoplay","");
    } else {
      audio.pause();
      $(audio).removeAttr("autoplay");
    }

    //Stop Propagation/Default Action
    return false;
  }

  return {
    setButton:  setButton,
    enable:     enable,
    disable:    disable
  };
})();

// Set status text and animations
var trackData = (function(){
  
  var $data     = null;

  var aniID     = "#animated-text",
      statusID  = "#status",
      cmdID     = "#command",
      artistID  = "#artist",
      cmdText   = "./fg179 --id ";

  function setNode($trackDataNode) {
    $data = $trackDataNode;
  }

  function setAniText(text) {
    var $aniText = $(aniID, $data);
    if ($aniText === null)
      throw new Error("(trackData) no " + aniID + " node found");
    else
      $aniText.text(text);
  }

  function setStatus(text) {
    var $status = $(statusID, $data);
    if ($status === null)
      throw new Error("(trackData) no " + statusID + " node found");
    else
      $status.text(text);
  }

  function setArtist(text) {
    var $artist = $(artistID, $data);
    if ($artist === null)
      throw new Error("(trackData) no " + artistID + " node found");
    else
      $artist.text(text);
  }

  function newSong(id, artist, title, trackNo, album, year) {
    var newCmd = cmdText + id;
    var $cmd = $(cmdID, $data);
    var cmdSequence = new Animation(0, false);
    var setTrackData = new Animation(1, false);
    var cmdSubStr = function(i) {
      return function() {
        $cmd.text(newCmd.substr(0,i));
      };
    }

    setTrackData.frames.push(function() {
      $("#artist", $data).text(artist);
      $("#title", $data).text(title);
      $("#track", $data).text(trackNo);
      $("#album", $data).text(album);
      $("#year", $data).text(year);
    });

    $cmd.text("");
    
    //Add cursor
    cmdSequence.frames.push(function() {
      $cmd.after("<span id=cursor>_</span>");
    });

    //Loop through newCmd
    for (var i = 1; i <= newCmd.length; i++) {
      cmdSequence.frames.push(cmdSubStr(i));
    }

    //Remove cursor
    cmdSequence.frames.push(function() {
      $cmd.siblings("#cursor").remove();
    });
    
    animator.add(cmdSequence);
    animator.add(setTrackData);

    twirl(newCmd.length + 3);
    revealAfter($("p:nth-of-type(2)", $data),newCmd.length + 7);
    revealAfter($("p:nth-of-type(3)", $data),newCmd.length + 9);
    revealAfter($("p:nth-of-type(4)", $data),newCmd.length + 11);

    animator.start(80);
  }

  function twirl(delay) {
    var twirler = new Animation(delay, true);

    var aniText = function(text) {
      return function() {
        setAniText(text);
      };
    }

    twirler.frames.push(aniText("-"));
    twirler.frames.push(aniText("\\"));
    twirler.frames.push(aniText("|"));
    twirler.frames.push(aniText("/"));
    
    animator.add(twirler);
  }

  function revealAfter($node, delay) {
    var hide    = new Animation(0, false);
    var reveal  = new Animation(delay, false);

    hide.frames.push(function() {
      $node.css("display", "none");
    });

    reveal.frames.push(function() {
      $node.removeAttr("style");
    });

    animator.add(hide);
    animator.add(reveal);
  }

  function stop() {
    animator.stop();
    setAniText("");
  }

  return {
    setNode:      setNode,
    setStatus:    setStatus,
    setArtist:    setArtist,
    stop:         stop,
    newSong:      newSong
  };

})();

//-------------
// Audio Events
//-------------

function play() {
  var $button = $("#play-pause");
  $button.removeClass("play");
  $button.addClass("pause");
  trackData.setStatus("Playing");
}

function pause() {
  var $button = $("#play-pause");
  $button.removeClass("pause");
  $button.addClass("play");
  trackData.setStatus("Paused");
}

function ready() {
  var $bumper = $("#track-position .bumper");
  progressBar.setPosition(0);
  pause(); 
}

function ended() {
  if (playlist.nextReady()) {
    playlist.next();
  } else {
    audio.pause;
  }
}

function initAudioPlayer() {
  audio = $("#audio-player > audio")[0];
  volumeKnob.setKnob($("#volume"));
  progressBar.setBumper($("#track-position .bumper"));
  playPause.setButton($("#play-pause"));
  trackData.setNode($("#track-data"));
  $(audio).on("play", play);
  $(audio).on("pause", pause);
  $(audio).on("loadeddata", ready);
  $(audio).on("ended", ended);
}

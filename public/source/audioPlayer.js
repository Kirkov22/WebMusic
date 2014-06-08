/*  Author: Tim Schofield
  
    Modules for the audio player controls
*/

//-------------------------------
// Audio Player General Functions
//-------------------------------

var player = (function() {
  var $player = $(),
      audio = new Audio("", false);

  var PLAYPAUSE   = "#play-pause",
      PLAY_VAL    = "\ue600",
      PAUSE_VAL   = "\ue601";

  function setPlayer($playerNode) {
    $player = $playerNode;
    audio.appendTo($player);
  }

  function enable() {
    audio.on("play", onPlay);
    audio.on("pause", onPause);
    audio.on("loadeddata", onReady);
    audio.on("ended", onEnded);
  }

  function onPlay() {
    var $button = $(PLAYPAUSE);
    $button.attr("icon-content", PAUSE_VAL);
    trackData.setStatus("Playing");
  }

  function onPause() {
    var $button = $(PLAYPAUSE);
    $button.attr("icon-content", PLAY_VAL);
    trackData.setStatus("Paused");
  }

  function onReady() {
    progressBar.setPosition(0);
    trackData.setStatus("Loaded");
  }

  function onEnded() {
    playlist.next();
  }

  function onTimeUpdate(funct) {
    audio.on("timeupdate", funct);
  }

  function offTimeUpdate(funct) {
    audio.off("timeupdate", funct);
  }

  function setVolume(volume) {
    audio.setVolume(volume);
  }

  function play() {
    audio.play();
    audio.setAutoplay(true);
  }

  function pause() {
    audio.pause();
    audio.setAutoplay(false);
  }

  function paused() {
    return audio.paused();
  }

  function setCurrentTime(time) {
    audio.setCurrentTime(time);
  }

  function getCurrentTime() {
    return audio.getCurrentTime();
  }

  function setToEnd() {
    audio.setToEnd();
  }

  function getDuration() {
    return audio.getDuration();
  }

  function setSrc(source) {
    audio.setSrc(source);
  }

  return {
    setPlayer:      setPlayer,
    enable:         enable,
    onTimeUpdate:   onTimeUpdate,
    offTimeUpdate:  offTimeUpdate,
    setVolume:      setVolume,
    play:           play,
    pause:          pause,
    paused:         paused,
    setCurrentTime: setCurrentTime,
    getCurrentTime: getCurrentTime,
    setToEnd:       setToEnd,
    getDuration:    getDuration,
    setSrc:         setSrc
  }
})();

// -------------
// Volume Adjust
// -------------

var volumeKnob = (function () {

  var $knob         = $(),
      $indicator    = $(),
      enabled       = false,
      knobCenterX   = 0,
      knobCenterY   = 0,
      lastQuadrant  = 4,
      opposite      = 0,
      adjacent      = 0;
  
  function setKnob($knobNode) {
    $knob         = $knobNode;
    $indicator    = $knob.children(".indicator");
    knobCenterX   = $knob.offset().left + ($knob.innerWidth() / 2);
    knobCenterY   = $knob.offset().top + ($knob.innerHeight() / 2);
  }

  function enable() {
    if ($knob.length === 0) {
      throw new Error("(volumeKnob) uninitialized $knob var");
    } else if (!enabled) {
      $knob.on("mousedown", adjustVolume);
      enabled = true;
    }
  }

  function disable() {
    $knob.off("mousedown", adjustVolume);
    enabled = false;
  }

  function adjustVolume(e) {
    $knob.on("mouseup", upHandler);
    $knob.on("mousemove", moveHandler);

    var theta = mouseAngle(e); 
    setByAngle(theta);

    e.target.setCapture();

    function moveHandler(e) {
      var theta = mouseAngle(e); 
      setByAngle(theta);

      // Stop Propagation/Default Action
      return false;
    }

    function upHandler(e) {
      $knob.off("mousemove", moveHandler);
      $knob.off("mouseup", upHandler);

      // Stop Propagation/Default Action
      return false;
    }

    // Stop Propagation/Default Action
    return false;
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
    player.setVolume(theta / 360);
  }
  
  // Set the indicator to the correct angle and update the class
  function spinKnob(theta) {
    $knob.removeClass();
    if (theta === 0) {
      $knob.attr("icon-content", "\ue608");
    } else if (theta < 90) {
      $knob.attr("icon-content", "\ue607");
    } else if (theta < 180) {
      $knob.attr("icon-content", "\ue606");
    } else if (theta < 270) {
      $knob.attr("icon-content", "\ue605");
    } else {
      $knob.attr("icon-content", "\ue604");
    }
    $indicator.css("transform", "rotate(" + theta + "deg)");
  }

  function setByPercent(percent) {
    spinKnob(percent * 3.6);
    player.setVolume(percent);
  }

  // Public methods
  return {
    setKnob:        setKnob,
    enable:         enable,
    disable:        disable,
    setByPercent:   setByPercent
  };
})();

// ---------------------
// Display Song Progress
// ---------------------

var progressBar = (function() {

  var $bumper       = $(),
      $progressBG   = $(),
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
    if ($bumper.length === 0) {
      throw new Error("(progressBar) uninitialized $bumper var");
    } else if (!enabled) {
      $bumper.on("mousedown", seek);
      player.onTimeUpdate(updateTime);
      enabled = true;
    }
  }

  function disable() {
    $bumper.off("mousedown", seek);
    player.offTimeUpdate(updateTime);
    enabled = false;
  }

  function seek(e) {
    player.offTimeUpdate(updateTime);
    $bumper.on("mouseup", upHandler);
    $bumper.on("mousemove", moveHandler);
    e.target.setCapture();
    
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
      
      // Stop Propagation/Default Action
      return false;
    }

    function upHandler(e) {
      $bumper.off("mousemove", moveHandler);
      $bumper.off("mouseup", upHandler);
      player.setCurrentTime(positionToTime());
      player.onTimeUpdate(updateTime);

      // Stop Propagation/Default Action
      return false;
    }

    // Stop Propagation/Default Action
    return false;
  }

  function positionToTime() {
    var percent = parseInt($bumper.css("left"), 10) /
      ($bumper.parent().width() - $bumper.width());
    var songLength = player.getDuration();
    return percent * songLength;
  }

  function setPosition(position) {
    $bumper.css("left", (position - 1) + "px");
    $progressBG.css("width", (position + halfWidth) + "px");
  }

  function updateTime() {
    var width = rightBound - pageOffset;
    var position = player.getCurrentTime() * width / player.getDuration();
    setPosition(position);

    // Stop Propagation/Default Action
    return false;
  }

  // Public Methods
  return {
    setBumper:    setBumper,
    enable:       enable,
    disable:      disable,
    setPosition:  setPosition,
    updateTime:   updateTime
  };
})();

// -----------------
// Playback Buttons
// -----------------

var playPause = (function() {

  var $button = $(),
      enabled = false;

  function setButton($buttonNode) {
    $button = $buttonNode; 
  }

  function enable() {
    if ($button.length === 0) {
      throw new Error("(playPause) uninitialized $button var");
    } else if (!enabled) {
      $button.on("click", buttonPress);
      enabled = true;
    }
  }

  function disable() {
    $button.off("click", buttonPress);
    enabled = false;
  }

  function buttonPress() {
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
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

var nextButton = (function() {
  var $button = $(),
      enabled = false;

  function setButton($buttonNode) {
    $button = $buttonNode;
  }

  function enable() {
    if ($button.length === 0) {
      throw new Error("(nextButton) unitialized $button var");
    } else if (!enabled) {
      $button.on("click", buttonPress);
      enabled = true;
    }
  }

  function disable() {
    $button.off("click", buttonPress);
    enabled = false;
  }

  function buttonPress() {
    playlist.next();

    //Stop Propagation/Default Action
    return false;
  }

  return {
    setButton:  setButton,
    enable:     enable,
    disable:    disable
  };
})();

var prevButton = (function() {
  var $button = $(),
      enabled = false;

  function setButton($buttonNode) {
    $button = $buttonNode;
  }

  function enable() {
    if ($button.length === 0) {
      throw new Error("(prevButton) unitialized $button var");
    } else if (!enabled) {
      $button.on("click", buttonPress);
      enabled = true;
    }
  }

  function disable() {
    $button.off("click", buttonPress);
    enabled = false;
  }

  function buttonPress() {
    playlist.prev();

    //Stop Propagation/Default Action
    return false;
  }

  return {
    setButton:  setButton,
    enable:     enable,
    disable:    disable
  };
})();

var continuousButton = (function() {
  var $button     = $(),
      enabled     = false,
      continuous  = false;

  function setButton($buttonNode) {
    $button = $buttonNode;
  }

  function enable() {
    if ($button.length === 0) {
      throw new Error("(continuousButton) unitialized $button var");
    } else if (!enabled) {
      $button.on("click", buttonPress);
      enabled = true;
    }
  }

  function disable() {
    $button.off("click", buttonPress);
    enabled = false;
  }

  function buttonPress() {
    if (continuous) {
      $button.removeAttr("style");
    } else {
      // If CSS for buttons ever changes, these statements will have to be updated
      $button.css("background", "linear-gradient(#86858b 0%, #86858b 49%, #68676c 50%, #605f64 100%)");
      $button.css("box-shadow", "0px 1px 3px #1c6a1a");
    }
    continuous = !continuous;
    playlist.evaluatePrevNext();

    //Stop Propagation/Default Action
    return false;
  }

  function isActive() {
    return continuous;
  }

  return {
    setButton:  setButton,
    enable:     enable,
    disable:    disable,
    isActive:   isActive
  };
})();

// ------------------------
// Display Song Data/Status
// ------------------------

var trackData = (function(){
  var $data     = $();

  var ANIMATEID = "#animated-text",
      STATUSID  = "#status",
      CMDID     = "#command",
      ARTISTID  = "#artist",
      CMDTEXT   = "./fg179 --id ";

  function setNode($trackDataNode) {
    $data = $trackDataNode;
  }

  function setAniText(text) {
    var $aniText = $(ANIMATEID, $data);
    if ($aniText.length === 0)
      throw new Error("(trackData) no " + ANIMATEID + " node found");
    else
      $aniText.text(text);
  }

  function setStatus(text) {
    var $status = $(STATUSID, $data);
    if ($status.length === 0)
      throw new Error("(trackData) no " + STATUSID + " node found");
    else
      $status.text(text);
  }

  function setArtist(text) {
    var $artist = $(ARTISTID, $data);
    if ($artist.length === 0)
      throw new Error("(trackData) no " + ARTISTID + " node found");
    else
      $artist.text(text);
  }

  function newSong(id, artist, title, trackNo, album) {
    var newCmd = CMDTEXT + id;
    var $cmd = $(CMDID, $data);
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
    });

    $cmd.text("");
    
    //Add cursor
    cmdSequence.frames.push(function() {
      $cmd.after("<span id=cursor>_</span>");
    });

    //Loop through newCmd
    var len = newCmd.length;
    for (var i = len; i--; ) {
      cmdSequence.frames.push(cmdSubStr(len - i));
    }

    //Remove cursor
    cmdSequence.frames.push(function() {
      $cmd.siblings("#cursor").remove();
    });
    
    animator.add(cmdSequence);
    animator.add(setTrackData);

    twirl(newCmd.length + 3);
    revealAfter($data.children().eq(1),len + 7);
    revealAfter($data.children().eq(2),len + 9);
    revealAfter($data.children().eq(3),len + 11);

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

function initAudioPlayer() {
  volumeKnob.setKnob($("#volume"));
  progressBar.setBumper($("#track-position .bumper"));
  playPause.setButton($("#play-pause"));
  nextButton.setButton($("#next"));
  prevButton.setButton($("#prev"));
  continuousButton.setButton($("#loop"));
  trackData.setNode($("#track-data"));
  player.setPlayer($("#audio-player"));
}

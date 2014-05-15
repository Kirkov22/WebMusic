// Author: Tim Schofield

// Animation object
function Animation(delay, looping) {
  this.frames   = [];
  this.delay    = delay;
  this.looping  = looping;
}

Animation.prototype.animate = function() {
  if (this.delay <= 0) {
    var frame = this.frames.shift();
    frame();
    if (this.looping)
      this.frames.push(frame);
  } else {
    this.delay--;
  }
}

Animation.prototype.isFinished = function() {
  return (this.frames.length === 0);
}

var animator = (function() {
  var animations    = [],
      timer         = null;

  function addAnimation(animation) {
    animations.push(animation);
  }

  function start(interval) {
    timer = setInterval(animate, interval);
  }

  function animate() {
    for(var i = 0; i < animations.length; i++) {
      animations[i].animate();
      if (animations[i].isFinished())
        animations.splice(i, 1);
    }
    if (animations.length === 0)
      clearInterval(timer);
  }

  function stop() {
    for(var i = 0; i < animations.length; i++) {
      if(animations[i].looping)
        animations.splice(i,1);
    }
  }
  
  return {
    add:    addAnimation,
    start:  start,
    stop:   stop
  };
})();

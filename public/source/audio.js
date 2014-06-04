/*  Author: Tim Schofield

    Class to combine features of jQuery and the audio HTML element
*/

function Audio(source, autoplay) {
  this.$node = $("<audio/>");
  this.setSrc(source);
  this.setAutoplay(autoplay);
}

Audio.prototype.setSrc = function(source) {
  if (source)
    this.$node.attr("src", source);
}

Audio.prototype.setAutoplay = function(autoplay) {
  if (autoplay)
    this.$node.attr("autoplay", "");
  else
    this.$node.removeAttr("autoplay");
}

Audio.prototype.play = function() {
  this.$node[0].play();
}

Audio.prototype.pause = function() {
  this.$node[0].pause();
}

Audio.prototype.paused = function() {
  return this.$node[0].paused;
}

Audio.prototype.setCurrentTime = function(time) {
  this.$node[0].currentTime = time || 0;
}

Audio.prototype.setVolume = function(vol) {
  this.$node[0].volume = vol || 50;
}

Audio.prototype.getDuration = function() {
  return this.$node[0].duration || 0;
}

Audio.prototype.getCurrentTime = function() {
  return this.$node[0].currentTime || 0;
}

Audio.prototype.setToEnd = function() {
  this.setCurrentTime(this.getDuration());
}

Audio.prototype.appendTo = function($target) {
  this.$node.appendTo($target);
}

Audio.prototype.on = function(eventName, funct) {
  if ((typeof funct === "function") && (typeof eventName === "string"))
    this.$node.on(eventName, funct);
}

Audio.prototype.off = function(eventName, funct) {
  if ((typeof funct === "function") && (typeof eventName === "string"))
    this.$node.off(eventName, funct);
}

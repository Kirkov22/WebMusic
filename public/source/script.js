//-----------------
// Helper Functions
//-----------------

// For each property in object, do action
function forEachIn(object, action) {
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      action(property, object[property]);
    }
  }
}

// Create a DOM node
//  ex. $make("<a>", {href: "http://google.com"}, "google");
function $make(tag, attributes /*, ... */) {
  var $node = $(tag);

  // Set node attributes
  if (attributes) {
    $node.attr(attributes);
  }

  // Set child content for node
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      $node.text(child);
    else
      $node.append(child);
  }
  return $node;
}

// Take a Javascript object and encode it for POST form data
function encodeFormData(data) {
  if (!data) return "";

  var pairs = [];
  for (var name in data) {
    // Don't include inherited properties or functions
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === "function") continue;

    var value = data[name].toString();
    name = encodeURIComponent(name).replace("%20", "+");
    value = encodeURIComponent(value).replace("%20", "+");
    pairs.push(name + "=" + value);
  }

  return pairs.join("&");
}

//Remove all rows from table except the first
function clearTable($table) {
  var $header = $table.children(":first");
  $header.siblings().remove();
}

//---------------
// Page Functions
//---------------

// Create an "Add/Remove" button
function makeAddButton(id) {
  return $make("<button>", {
    type : "button",
    "class" : "add_remove"
  }, "+");
}

//Takes JSON tag data and returns a jQuery TR node
function $tagsToTr(song) {
  var $tr = $make("<tr>", { songID : song.id });

  $tr.append($make("<td>", {}, song.artist));
  $tr.append($make("<td>", {}, song.album));
  $tr.append($make("<td>", {}, song.track.toString()));
  $tr.append($make("<td>", {}, song.title));
  $tr.append(makeAddButton(song.id));

  return $tr;
}

// Retrieve array of JSON objects containing tag data
//  and add each as a row in $table
function addSongListing(url, $table) {
  $.get(url,
    function(songs) {
      songs.forEach(function(tags) {
        $table.append($tagsToTr(tags));
      });
    },
    "json");
}
  
// Update the table listing song choices
function updateLibraryTable() {
  var $library = $("#library");
  clearTable($library);
  addSongListing("getfilelist", $library);
}

// Add song to playlist
function songToPL($song_row) {
  $song_row.clone().appendTo($("#playlist"));
}

// Add event handlers to document
$(document).ready(function() {
  $("#library").on("click", ".add_remove", function() {
    songToPL($(this.parentNode));
  });
});

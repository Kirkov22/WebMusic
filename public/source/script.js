//-----------------
// Helper Functions
//-----------------

// Shorthand for getElementById
function $(id) {
  return document.getElementById(id);
}

// Remove node from the document
function removeNode(node) {
  return node.parentNode.removeChild(node);
}

// For each property in object, do action
function forEachIn(object, action) {
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      action(property, object[property]);
    }
  }
}

// Create a DOM node
//  ex. makeNode("A", {href: "http://google.com"}, "google");
function makeNode(name, attributes /*, ... */) {
  var node = document.createElement(name);

  // Set node attributes
  if (attributes) {
    forEachIn(attributes, function(name, value) {
      node.setAttribute(name, value)
    });
  }

  // Set child content for node
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

// return an XML HTTP Request object
function makeHttpObject() {
  try {
    return new XMLHttpRequest();
  } catch (error) { }
  
  throw new Error("Could not create HTTP request object.");
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

//Encode Javascript object as form data and posts it to a script
function postFormToScript(scriptName, data) {
  var requester = makeHttpObject();
  requester.open("POST", scriptName, false);
  requester.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  body = encodeFormData(data);
  requester.send(body);
  return requester.responseText;
}

//Takes JSON oject and transforms it to DOC TR node
function jsonToTr(object) {
  var tr = makeNode("TR", {});

  tr.appendChild(makeNode("TD", {}, object.artist));
  tr.appendChild(makeNode("TD", {}, object.album));
  tr.appendChild(makeNode("TD", {}, object.track.toString()));
  tr.appendChild(makeNode("TD", {}, object.title));

  return tr;
}

//Remove all rows from table except the first
function clearTable(table) {
  var rows = table.getElementsByTagName("TR");
  while (rows[1]) {
    removeNode(rows[1]);
  }
}

//---------------
// Page Functions
//---------------

// Get song listing from app
function getSongListing() {
  var requester = makeHttpObject();
  requester.open("GET", "getfilelist", false);
  requester.send(null);
  var text = requester.responseText;
  return JSON.parse(text);
}

// Update the table listing song choices
function updateListingTable() {
  var selectTable = $("selections");
  clearTable(selectTable);
  var songs = getSongListing();
  forEachIn(songs, function(song, tag) {
    var tr = jsonToTr(tag);
    selectTable.appendChild(tr);
  });
}

//Temp function to add an audio tag to the document in the
// "target" DIV
function changeTarget() {
  var target = $("target");
//   var path_to_music = postToScript("music", {
//     song : "test_id3v1.mp3" 
//   });
//   var newNode = makeNode("AUDIO", {
//     src       : path_to_music,
//     preload   : "none",
//     controls  : ""
//   }, makeNode("P", {}, "This audio format is not supported by your browser."));
//   var par = makeNode("P", {}, getJson());
  clearTable(target);
  var response = getJson();
  forEachIn(response, function(song, tag) {
    var tr = jsonToTr(tag);
    target.appendChild(tr);
  });
}

// Temp function to get json data from script
function getJson() {
  var requester = makeHttpObject();
  requester.open("GET", "getfilelist", false);
  requester.send(null);
  var text = requester.responseText;
  return JSON.parse(text);
}

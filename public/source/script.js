//-----------------
// Helper Functions
//-----------------

// Shorthand for getElementById
function $(id) {
  return document.getElementById(id);
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

function postToScript(scriptName, data) {
  var requester = makeHttpObject();
  requester.open("POST", scriptName, false);
  requester.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  body = encodeFormData(data);
  requester.send(body);
  return requester.responseText;
}

//---------------
// Page Functions
//---------------

//Temp function to add an audio tag to the document in the
// "target" DIV
function changeTarget() {
  var target = $("target");
  var path_to_music = postToScript("music", {
    song : "test_id3v1.mp3" 
  });
  var newNode = makeNode("AUDIO", {
    src       : path_to_music,
    preload   : "none",
    controls  : ""
  }, makeNode("P", {}, "This audio format is not supported by your browser."));
  target.appendChild(newNode);
}
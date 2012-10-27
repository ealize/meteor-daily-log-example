// Define Minimongo collections to match server/publish.js.
Entries = new Meteor.Collection("entries");

// ID of currently selected entry
Session.set('entry_id', null);

// When editing a Entry name, ID of the Entry
Session.set('editing_entryname', null);

Meteor.subscribe('entries', function () {
  if (!Session.get('entry_id')) {
    var entry = Entries.findOne({}, {sort: {_id: 1}});
    if (entry)
      Router.setEntry(entry._id);
  }
});

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};



////////// Routing URL //////////
var simpleRouter = Backbone.Router.extend({
  routes: {
    ":entry_id": "main"
  },
  main: function (entry_id) {
    Session.set("entry_id", entry_id);
  },
  setEntry: function (entry_id) {
    this.navigate(entry_id, true);
  }
});

Router = new simpleRouter;


Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});


// template handlers
// populate the Entries
Template.entries.entries = function () {
  return Entries.find({}, {sort: {_id: 1}});
};


// Interact with entry list
Template.entries.events({
  'mousedown .entries': function (evt) { // select list
  
  },
  'click .entry': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    Router.setEntry(this._id);    
    evt.preventDefault();
  },
  'dblclick .entry': function (evt, tmpl) { // start editing entry name
    Session.set('editing_entryname', this._id);
    console.log("Setting session to " + this._id );
    Meteor.flush(); // force DOM redraw, so we can focus the edit field
    activateInput(tmpl.find("#entry-name-input"));
  },
  'click .destroy': function (evt) {
    evt.preventDefault();
    Entries.remove(this._id);
  },
});


// Attach events to keydown, keyup, and blur on "New list" input box.
Template.entries.events(okCancelEvents(
  '#new-entry',
  {
    ok: function (text, evt) {
      var id = Entries.insert({text: text});
      Router.setEntry(id);
      evt.target.value = "";
    }
  }));

Template.entries.events(okCancelEvents(
  '#entry-name-input',
  {
    ok: function (value) {
      Entries.update(this._id, {$set: {text: value}});
      Session.set('editing_entryname', null);
    },
    cancel: function () {
      Session.set('editing_entryname', null);
    }
  }));

Template.entries.selected = function () {
  return Session.equals('entry_id', this._id) ? 'selected' : '';
};

Template.entries.name_class = function () {
  return this.name ? '' : 'empty';
};

Template.entries.editing = function () {
  console.log("Session has: " + Session.equals('editing_entryname', this._id));
  console.log("Session has " + Session.get('editing_entryname') );
  return Session.equals('editing_entryname', this._id);
};
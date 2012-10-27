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

// -- Router Stuff
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

// -- Temnplate binding

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
    Meteor.flush(); // force DOM redraw, so we can focus the edit field
    //activateInput(tmpl.find("#entry-log-input"));
    var editForm = tmpl.find(".editForm");
    $(editForm).css("display", "block");
  },
  'click .destroy': function (evt) {
    evt.preventDefault();
    Entries.remove(this._id);
  },

  'click .btnAddNewEntry' : function (evt,tmpl) {
    var day = tmpl.find(".entry-day-input");
    var log = tmpl.find(".entry-log-input");
    var editing = tmpl.find(".editing");;
    //-- should probably figure out something nicer
    if (editing)
    {
      Entries.update(this._id, {$set: {log: $(log).val(), day: $(day).val()}});
      Session.set('editing_entryname', null);
    }
    else
    {
      var id = Entries.insert({log: $(log).val(), day: $(day).val()});
      Router.setEntry(id);
    }
    
    day.value = "";
    log.value = "";
    evt.target.value = "";
    $(tmpl.find(".editForm")).css("display", 'none');
  }
  ,'click .editLink' : function(evt, tmpl) {
    var editForm = tmpl.find(".editForm");
    $(editForm).css("display", "block");
  }
  ,'click .btnCloseEdit' : function(evt, tmpl) {
    var editForm = tmpl.find(".editForm");
    $(editForm).css("display", "none");
    Session.set('editing_entryname', null);
  }
});

Template.entries.selected = function () {
  return Session.equals('entry_id', this._id) ? 'selected' : '';
};

Template.entries.name_class = function () {
  return this.log ? '' : 'empty';
};

Template.entries.editing = function () {
  return Session.equals('editing_entryname', this._id) || Session.get('editing_entryname');
};
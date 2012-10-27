//server.js
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Entries = new Meteor.Collection("entries");
Meteor.publish('entries', function () {
  return Entries.find();
});

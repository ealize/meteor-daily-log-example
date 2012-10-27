//server.js
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Entries = new Meteor.Collection("entries");
// Publish complete set of lists to all clients.
Meteor.publish('entries', function () {
  return Entries.find();
});

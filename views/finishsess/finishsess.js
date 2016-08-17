var config = require("../../shared/config");
var frameModule = require("ui/frame");
var util = require("~/utils.js")
var LocalNotifications = require("nativescript-local-notifications");
var page;

exports.loaded = function(args) {
    page = args.object
    var gotData=page.navigationContext;
    console.log(gotData.treatments);
    page.getViewById("sess-results").text = "You treated " + gotData.treatments + " areas during this session.  Your session has been recorded.\n\nTouch below to return to the device hub and take a picture for future comparison.";
    util.linearGradient(page, "return-btn", ['#ef706d', '#934544']);
    util.linearGradient(page, "support-btn", ['#ef706d', '#934544']);

    return fetch(config.apiUrl, {
        method: "POST",
        body: 'insertsession=true&treated=' + gotData.treated + '&quickrecord=true&email=' + global.useremail + '&device=' + global.currentdevice,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
    .then(handleErrors)
    .then(function(data) {
        console.log("Saved final session");
        LocalNotifications.schedule([{
            id: 1,
            title: 'Your Quasar misses you!',
            body: 'Your Quasar misses you! You have not used your device in four days.',
            at: new Date(new Date().getTime() + (60 * 1000 * 60 * 24 * 4)) // 60 seconds * 1000 milliseconds * 60 minutes * 24 hours * 4 days
        }]).then(
            function() {
                console.log("Notification Scheduled");
            },
            function(error) {
                console.log("Error scheduling: " + error);
            }
        );
    });
};

exports.onNavigatingTo = function() {

};

exports.goSupport = function(args) {
    frameModule.topmost().navigate("views/support/support");
};

exports.goHub = function(args) {
    frameModule.topmost().navigate("views/list/list");
};

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

//global.currentdevice = viewModel.getItem(index).imgid;
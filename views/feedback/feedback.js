var config = require("../../shared/config");
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var gestures = require("ui/gestures");
var textViewModule = require("ui/text-view");
var appSettings = require("application-settings");

var page;
var experience = 'no-selection';

exports.loaded = function(args) {
    page = args.object;
    appSettings.setString("usecount", "feedbacksent");
};

exports.sendFeedback = function() {
    var comments = page.getViewById("comments").text;
    return fetch(config.apiUrl, {
        method: "POST",
        body: 'feedback=true&email=' + global.useremail + "&e=" + experience + "&comments=" + encodeURI(comments),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
        .then(handleErrors)
        .then(function(data) {
            frameModule.topmost().navigate("views/list/list");
        });
};
exports.skipFeedback = function() {
    frameModule.topmost().navigate("views/list/list");
};

exports.check1 = function() {
    page.getViewById("radio1").text = "X";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "";
    experience = "excellent";
};

exports.check2 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "X";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "";
    experience = "good";
};

exports.check3 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "X";
    page.getViewById("radio4").text = "";
    experience = "fair";
};

exports.check4 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "X";
    experience = "poor";
};

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
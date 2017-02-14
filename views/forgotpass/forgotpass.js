var config = require("../../shared/config");
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var gestures = require("ui/gestures");
var textViewModule = require("ui/text-view");

var page;

exports.loaded = function(args) {
    page = args.object;
};

exports.sendReset = function() {
    var resetemail = page.getViewById("resetemail").text;
    return fetch(config.apiUrl, {
        method: "POST",
        body: 'resetpass=true&email=' + resetemail,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
        .then(handleErrors)
        .then(function(data) {
            console.dump(data);
            frameModule.topmost().navigate("views/login/login");
        });
};

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
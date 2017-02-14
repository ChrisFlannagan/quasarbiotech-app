var config = require("../../shared/config");
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var gestures = require("ui/gestures");
var email = require("nativescript-email");
var phone = require( "nativescript-phone" );

var appSettings = require("application-settings");

exports.loaded = function(args) {
    var page = args.object;
    if(appSettings.getBoolean("logged")) {
        page.getViewById("email").text = global.useremail;
    }
    var tab1 = view.getViewById(page, "mainStack");
    tab1.observe(gestures.GestureTypes.tap, function (args) {
        /*
        page.getViewById("phone").dismissSoftInput();
        page.getViewById("yourname").dismissSoftInput();
        page.getViewById("email").dismissSoftInput();
        */
    });
};
exports.giveFeedback = function() {
    frameModule.topmost().navigate("views/feedback/feedback");
};
exports.goLogout = function() {
    appSettings.setBoolean("logged", false);
    frameModule.topmost().navigate("views/login/login");
};
exports.callSupport = function() {
    phone.dial("800-944-1523",false);
};
exports.sendEmail = function(args) {
    return fetch(config.apiUrl, {
        method: "POST",
        body: 'emailsupport=true&email=' + args.object.page.getViewById("email").text + "&phone=" + args.object.page.getViewById("phone").text + "&name=" + args.object.page.getViewById("yourname").text,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
        .then(handleErrors)
        .then(function(data) {
            args.object.page.getViewById("phone").text = '';
            args.object.page.getViewById("email").text = '';
            args.object.page.getViewById("yourname").text = '';
            alert("Contact Request Sent!");
            frameModule.topmost().navigate("views/list/list");
        });
};



function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
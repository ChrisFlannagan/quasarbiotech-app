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

    /*
        email.available().then(function(avail) {
            console.log("Email available? " + args.object.page.getViewById("email").text);


            email.compose({
                subject: "Support Request from Quasar App - ",
                body: args.object.page.getViewById("email").text + "\n" + args.object.page.getViewById("phone").text + "\n" + args.object.page.getViewById("name").text,
                to: ['info@quasarbiotech.com', 'chris@quasarbiotech.com']
            }).then(function() {
                args.object.page.getViewById("phone").text = '';
                args.object.page.getViewById("email").text = '';
                args.object.page.getViewById("yourname").text = '';
                alert("Contact Request Sent!");
            });
        });
    */
};



function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var email = require("nativescript-email");
var phone = require( "nativescript-phone" );

var appSettings = require("application-settings");

exports.loaded = function(args) {
    var page = args.object;
    if(appSettings.getBoolean("logged")) {
        page.getViewById("email").text = global.useremail;
    }
};

exports.callSupport = function() {
    phone.dial("800-944-1523",false);
};
exports.sendEmail = function(args) {
    console.log( 'Please send' );
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
            alert("Contact Request Sent");
        });
    });
};
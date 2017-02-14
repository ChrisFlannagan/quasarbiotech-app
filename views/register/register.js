var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var appSettings = require("application-settings");

var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var page;

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
};

function completeRegistration() {
    user.register()
        .then(function(response) {
            dialogsModule
                .alert(response)
                .then(function() {
                    appSettings.setString("usecount", "none");
                    frameModule.topmost().navigate("views/login/login");
                });
        }).catch(function() {
            dialogsModule
                .alert({
                    message: "Email was invalid, already in use or password blank",
                    okButtonText: "OK"
                });
        });
}

exports.register = function() {
    completeRegistration();
};
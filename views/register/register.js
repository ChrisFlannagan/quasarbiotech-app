var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");

var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
};

function completeRegistration() {
    user.register()
        .then(function(response) {
            dialogsModule
                .alert(response)
                .then(function() {
                    frameModule.topmost().navigate("views/login/login");
                });
        }).catch(function() {
            dialogsModule
                .alert({
                    message: "Email was invalid or password blank",
                    okButtonText: "OK"
                });
        });
}

exports.register = function() {
    completeRegistration();
};
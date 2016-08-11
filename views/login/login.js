var dialogsModule = require("ui/dialogs");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel({
    email: "",
    password: "",
    showLogin: false
});

var frameModule = require("ui/frame");
var util = require("~/utils.js");
var signin = false;
var page;

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
    util.linearGradient(page, "support-btn", ['#ef706d', '#934544']);
};
exports.signIn = function() {
    if(signin) {
        user.login()
            .catch(function (error) {
                console.log(error);
                dialogsModule.alert({
                    message: "Unfortunately we could not find your account.",
                    okButtonText: "OK"
                });
                return Promise.reject();
            })
            .then(function () {
                frameModule.topmost().navigate("views/list/list");
            });
    } else {
        user.set("showLogin", !user.get("showLogin"));
        signin = true;
    }
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/register/register");
};

exports.goSupport = function(args) {
    frameModule.topmost().navigate("views/support/support");
};
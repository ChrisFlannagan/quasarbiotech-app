var frameModule = require("ui/frame");
var appSettings = require("application-settings");

exports.continue = function() {
    appSettings.setBoolean("introduction", true);
    var navigationOptions={
        moduleName: "views/list/list"
    };

    frameModule.topmost().navigate(navigationOptions);
};
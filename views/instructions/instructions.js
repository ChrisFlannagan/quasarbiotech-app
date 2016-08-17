var page;
var gotData;

var frameModule = require("ui/frame");

exports.loaded = function(args) {
    page = args.object;
    gotData = page.navigationContext;
};

exports.continue = function() {
    var navigationOptions={
        moduleName: "views/devicehub/devicehub",
        context: gotData
    }

    frameModule.topmost().navigate(navigationOptions);
};
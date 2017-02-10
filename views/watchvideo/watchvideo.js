var page;
var observable = require("data/observable");

// Our new Observable view model for data binding
var viewmodel = new observable.Observable({});

exports.loaded = function(args) {
    page = args.object;
    var gotData = page.navigationContext;
    viewmodel.set("htmlString", gotData.watch);
    viewmodel.set("thetitle", gotData.thetitle);
    page.bindingContext = viewmodel;
};
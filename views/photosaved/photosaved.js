var observable = require("data/observable");
var viewModule = require("ui/core/view");
var pageData = new observable.Observable();
var frameModule = require("ui/frame");
var page;

exports.loaded = function(args) {
    page = args.object;
    var gotData=page.navigationContext;
    pageData.set("savedpic", gotData.photo1);
    page.bindingContext = pageData;
};

exports.gobackBtn = function() {
    frameModule.topmost().goBack();
};
var dialogsModule = require("ui/dialogs");
var ui = require("ui/label");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var DeviceListViewModel = require("../../shared/view-models/device-list-view-model");
var frameModule = require("ui/frame");
var page;
var util = require("~/utils.js")
var appSettings = require("application-settings");

var deviceList = new DeviceListViewModel([]);
var pageData = new Observable({
    deviceList: deviceList
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;

    deviceList.empty();
    console.log("loading");
    deviceList.load();
    util.linearGradient(page, "support-btn", ['#ef706d', '#934544']);
};

exports.devicehub = function(args) {
    var item = args.view.bindingContext;
    var index = deviceList.indexOf(item);
    deviceList.devicehub(index);
}

exports.goSupport = function(args) {
    frameModule.topmost().navigate("views/support/support");
};
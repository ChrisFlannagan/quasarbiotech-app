var dialogsModule = require("ui/dialogs");
var ui = require("ui/label");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var viewModule = require("ui/core/view");
var DeviceListViewModel = require("../../shared/view-models/device-list-view-model");
var page;
var util = require("~/utils.js")

var deviceList = new DeviceListViewModel([]);
var pageData = new Observable({
    deviceList: deviceList
});

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = pageData;

    deviceList.empty();
    deviceList.load();
    var page = args.object;
    util.linearGradient(page, "support-btn", ['#ef706d', '#934544']);
};

exports.devicehub = function(args) {
    var item = args.view.bindingContext;
    var index = deviceList.indexOf(item);
    deviceList.devicehub(index);
}
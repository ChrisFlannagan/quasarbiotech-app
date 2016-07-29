var config = require("../../shared/config");
var fetchModule = require("fetch");
var frameModule = require("ui/frame");
var ObservableArray = require("data/observable-array").ObservableArray;

function DeviceListViewModel(items) {
    var viewModel = new ObservableArray(items);

    viewModel.load = function() {
        return fetch(config.apiUrl, {
            method: "POST",
                body: 'devicelist=true',
                headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
            .then(handleErrors)
            .then(function(data) {
                var devices = JSON.parse(data._bodyInit);
                devices.forEach(function(device) {
                    viewModel.push({
                        name: device.Name,
                        imgid: device.ID,
                        icon: "~/images/" + device.Icon.replace("\\", "")
                    });
                });
            })
    };

    viewModel.empty = function() {
        while (viewModel.length) {
            viewModel.pop();
        }
    };

    viewModel.devicehub = function(index) {
        global.currentdevice = viewModel.getItem(index).imgid;
        var navigationOptions={
            moduleName:"views/devicehub/devicehub",
            context:{
                deviceID: viewModel.getItem(index).imgid,
                name: viewModel.getItem(index).name,
                icon: viewModel.getItem(index).icon
            }
        }

        frameModule.topmost().navigate(navigationOptions);
    }

    return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = DeviceListViewModel;
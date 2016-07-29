var config = require("../../shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var fs = require("file-system");

var lastuse = '';

function SessionsListViewModel(items) {
    var viewModel = new ObservableArray(items);

    viewModel.load = function() {
        return fetch(config.apiUrl, {
            method: "POST",
            body: 'getsessions=true&email=' + global.useremail + '&device=' + global.currentdevice,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
            .then(handleErrors)
            .then(function(data) {
                var sessions = JSON.parse(data._bodyInit);
                console.log("LOADING: " + data._bodyInit);
                sessions.forEach(function(session) {
                    if(lastuse == '') {
                        lastuse = session.timeof;
                    }
                    viewModel.push({
                        name: session.timeof,
                        img: fs.knownFolders.documents().path + "/" + session.photo
                    });
                });

            });
    };

    viewModel.empty = function() {
        while (viewModel.length) {
            viewModel.pop();
        }
    };

    viewModel.removesession = function(index) {
        viewModel.splice(index, 1);
    };

    viewModel.getLatest = function() {
        return lastuse;
    };

    return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = SessionsListViewModel;
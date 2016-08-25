var config = require("../../shared/config");
var ObservableArray = require("data/observable-array").ObservableArray;
var fs = require("file-system");
var sessids;
var photos;

var lastuse = '';

function SessionsListViewModel(items) {
    var viewModel = new ObservableArray(items);

    viewModel.load = function() {
        photos = new Array();
        lastuse = '';
        return fetch(config.apiUrl, {
            method: "POST",
            body: 'getsessions=true&email=' + global.useremail + '&device=' + global.currentdevice,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
            .then(handleErrors)
            .then(function(data) {
                sessids = new Array();
                var sessions = JSON.parse(data._bodyInit);
                sessions.forEach(function(session) {
                    var spsess = session.timeof.split(' ');
                    var spdate = spsess[0].split('-');
                    var latestuse = spdate[1] + '/' + spdate[2] + '/' + spdate[0] + ' ' + spsess[1];
                    if(lastuse == '') {
                        lastuse = session.timeof;
                    }
                    if(session.photo != '') {
                        photos.push(fs.knownFolders.documents().path + "/" + session.photo);
                    }
                    viewModel.push({
                        name: latestuse,
                        img: fs.knownFolders.documents().path + "/" + session.photo
                    });
                    sessids.push(session.ID);
                });

            });
    };

    viewModel.empty = function() {
        while (viewModel.length) {
            viewModel.pop();
        }
    };

    viewModel.removesession = function(index) {

        return fetch(config.apiUrl, {
            method: "POST",
            body: 'remsession=true&email=' + global.useremail + '&index=' + sessids[index],
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
            .then(handleErrors)
            .then(function(data) {
                viewModel.splice(index, 1);
                console.log("Index ID: " + sessids[index]);
                sessids.splice(index, 1);
            });

    };

    viewModel.getLatest = function() {
        return lastuse;
    }

    viewModel.getPhotos = function() {
        return photos;
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

module.exports = SessionsListViewModel;
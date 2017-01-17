var config = require("../../shared/config");
var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var md5 = require("js-md5");
var appSettings = require("application-settings");

function User(info) {
    info = info || {};

    // You can add properties to observables on creation
    var viewModel = new Observable({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.login = function () {
        global.useremail = viewModel.get("email");
        appSettings.setBoolean("logged", true);
        appSettings.setString("useremail", viewModel.get("email"));
        return fetchModule.fetch(config.apiUrl, {
            method: "POST",
            body: 'login=true&email=' + viewModel.get("email") + '&pass=' + md5(viewModel.get("password")),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        }).then(handleErrors)
            .then(function (response) {
                return response.text();
            })
    };

    viewModel.register = function () {
        return fetchModule.fetch(config.apiUrl, {
            method: "POST",
            body: 'reg=true&email=' + viewModel.get("email") + '&pass=' + md5(viewModel.get("password")) + '&birth=' + viewModel.get("birth"),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        }).then(handleErrors)
            .then(function (response) {
                return response.text();
            });
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

module.exports = User;
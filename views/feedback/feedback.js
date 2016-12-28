var textViewModule = require("ui/text-view");

var page;
exports.loaded = function(args) {
    page = args.object;
};

exports.check1 = function() {
    page.getViewById("radio1").text = "X";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "";
};

exports.check2 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "X";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "";
};

exports.check3 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "X";
    page.getViewById("radio4").text = "";
};

exports.check4 = function() {
    page.getViewById("radio1").text = "";
    page.getViewById("radio2").text = "";
    page.getViewById("radio3").text = "";
    page.getViewById("radio4").text = "X";
};
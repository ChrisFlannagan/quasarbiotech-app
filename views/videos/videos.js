var page;
var picker;
var observable = require("data/observable");

// Our new Observable view model for data binding
var viewmodel = new observable.Observable({});

exports.loaded = function(args) {
    page = args.object;
    picker = page.getViewById("picker");
    picker.items = ["Baby Quasar & MD PLUS", "Baby BLUE & MD BLUE", "Clear Rayz"];
    picker.items.className = "picker";
};

exports.watchVideo = function() {
    console.log(picker.selectedIndex);
    if(picker.selectedIndex == 0) {
        viewmodel.set("htmlString", '<iframe width="100%" height="250" src="https://www.youtube.com/embed/m-wyjHJXmvI"frameborder="0"></iframe>');
        page.bindingContext = viewmodel;
    }
};
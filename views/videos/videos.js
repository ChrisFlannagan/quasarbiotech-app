var observable = require("data/observable");
var frameModule = require("ui/frame");
var page;
var picker;

// Our new Observable view model for data binding
var viewmodel = new observable.Observable({});

exports.loaded = function(args) {
    page = args.object;
    picker = page.getViewById("picker");
    picker.items = ["Baby Quasar & MD PLUS", "Baby BLUE & MD BLUE", "Clear Rayz"];
    picker.items.className = "picker";
};

exports.watchVideo = function() {
    var towatch = '';
    var ttitle = '';
    console.log("selected: " + picker.selectedIndex);
    if(picker.selectedIndex == 0) {
        ttitle = 'Baby Quasar & MD PLUS';
        towatch = '<body style="background:#ff8986;padding:0px;margin;)px"><iframe width="100%" height="250" src="https://www.youtube.com/embed/m-wyjHJXmvI" frameborder="0"></iframe></body>';
    }
    if(picker.selectedIndex == 1) {
        ttitle = 'Baby BLUE & MD BLUE';
        towatch = '<body style="background:#ff8986;padding:0px;margin;)px"><iframe width="100%" height="250" src="https://www.youtube.com/embed/rgfjQUU_STI" frameborder="0"></iframe></body>';
    }
    if(picker.selectedIndex == 2) {
        ttitle = 'Clear Rayz';
        towatch = '<body style="background:#ff8986;padding:0px;margin;)px"><iframe width="100%" height="250" src="https://www.youtube.com/embed/a8Thk--y0gc" frameborder="0"></iframe></body>';
    }
    console.log("To watch: " + towatch);

    var navigationOptions;
    navigationOptions = {
        moduleName:"views/watchvideo/watchvideo",
        context:{
            thetitle: ttitle,
            watch: towatch
        }
    };
    frameModule.topmost().navigate(navigationOptions);
};
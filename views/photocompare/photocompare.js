var observable = require("data/observable");
var viewModule = require("ui/core/view");
var sliderModule = require("ui/slider");
var pageData = new observable.Observable();
var page;
var quad;
var slider;

exports.loaded = function(args) {
    page = args.object;
    quad = viewModule.getViewById(page, "p1");
    slider = page.getViewById("changeSlider");
    slider.minValue = 0;
    slider.maxValue = 10;
    slider.value = 5;
    slider.on('propertyChange', function (args) {
        console.log(parseInt(args.value));
        console.log("-" + (parseInt(args.value)/10));
        pageData.set("a1", parseInt(args.value)/10);
    });
    
    var prepage = args.object;
    var gotData=prepage.navigationContext;
    pageData.set("comparebase", gotData.photo1);
    pageData.set("comparephoto", gotData.photo2);
    pageData.set("a1", ".5");
    pageData.set("parentWidth", quad.getMeasuredWidth());
    pageData.set("parentHeight", quad.getMeasuredHeight());
    page.bindingContext = pageData;
    console.log(gotData.photo1);
    console.log(gotData.photo2);
};
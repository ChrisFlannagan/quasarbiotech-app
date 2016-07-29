var gestures = require("ui/gestures");
var viewModule = require("ui/core/view");
var imageModule = require("ui/image");
var absoluteLayoutModule = require("ui/layouts/absolute-layout");

var page;
var quad;
var quads = new Array();
var face;

exports.loaded = function(args) {
    page = args.object;
    quad = viewModule.getViewById(page, "main-layout");
    face = new absoluteLayoutModule.AbsoluteLayout();
    viewModule.getViewById(page, "main-layout").addChild(face);

    quad.on(gestures.GestureTypes.touch, function (args) {
        console.log( args.getX() );

        var deviceimg = new imageModule.Image();
        absoluteLayoutModule.AbsoluteLayout.setLeft(deviceimg, args.getX()-30);
        absoluteLayoutModule.AbsoluteLayout.setTop(deviceimg, args.getY()-30);
        deviceimg.src = "~/images/babyblue-sess.png";
        face.addChild(deviceimg);
    });
}
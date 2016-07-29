var applicationModule = require("application");
var appSettings = require("application-settings");
global.useremail = 'unset';
global.currentdevice = '0';


if(appSettings.getBoolean("logged")) {
    global.useremail = appSettings.getString("useremail");
    applicationModule.start({ moduleName: "views/list/list" });
    //applicationModule.start({moduleName: "views/login/login"});
} else {
    applicationModule.start({moduleName: "views/login/login"});
}

var platform = require("platform");
var coreView = require("ui/core/view");
var colorModule = require("color");
var Color = colorModule.Color;

function pageLoaded(args) {
    var page = args.object;

    linearGradient(page, "contentArea", ['#123456', '#345645']);
}
exports.pageLoaded = pageLoaded;

var coreView = require("ui/core/view"),
    colorModule = require("color"),
    Color = colorModule.Color;

function linearGradient(root, viewId, colors, stops) {
    console.log(platform.device.os);
    var _colors = [],
        _view = coreView.getViewById(root, viewId),
        nativeView;

    if (_view) {
        nativeView = _view._nativeView;
    } else {
        throw TraceableException("Cannot find view '" + view + "' in page!");
    }

    if (!nativeView) {
        return;
    }

    colors.forEach(function(c, idx) {
        if (!(c instanceof Color)) {
            colors[idx] = new Color(c);
        }
    });

    if (platform.device.os=== platform.platformNames.android) {
        console.log("android");
        var backgroundDrawable = nativeView.getBackground(),
            orientation = android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM,
            LINEAR_GRADIENT = 0;

        colors.forEach(function(c) {
            _colors.push(c.android);
        });

        if (!(backgroundDrawable instanceof android.graphics.drawable.GradientDrawable)) {
            backgroundDrawable = new android.graphics.drawable.GradientDrawable();
            backgroundDrawable.setColors(_colors);
            backgroundDrawable.setGradientType(LINEAR_GRADIENT);
            nativeView.setBackgroundDrawable(backgroundDrawable);
        }
    } else if (platform.device.os === platform.platformNames.ios) {
        console.log("ios");
        var view = root.ios.view;
        var colorsArray = NSMutableArray.alloc().initWithCapacity(2);
        colors.forEach(function(c) {
            colorsArray.addObject(interop.types.id(c.ios.CGColor));
        });
        var gradientLayer = CAGradientLayer.layer();
        gradientLayer.colors = colorsArray;
        gradientLayer.frame = view.bounds;
        view.layer.insertSublayerAtIndex(gradientLayer,0);
    }
}
exports.linearGradient = linearGradient;
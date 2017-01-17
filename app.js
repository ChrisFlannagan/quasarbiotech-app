var applicationModule = require("application");
var appSettings = require("application-settings");
global.useremail = 'unset';
global.currentdevice = '0';

if(appSettings.getBoolean("logged")) {
    global.useremail = appSettings.getString("useremail");
    if(undefined == appSettings.getString("usecount")) {
        appSettings.setString("usecount", "none");
    } else if(appSettings.getString("usecount") == "ready") {
        applicationModule.start({moduleName: "views/feedback/feedback"});
    } else {
        applicationModule.start({moduleName: "views/list/list"});
    }
} else {
    applicationModule.start({moduleName: "views/login/login"});
}
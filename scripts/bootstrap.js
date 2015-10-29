require("shelljs/global");

var path = require("path");
var fs   = require("fs");

var OFFLINE = !!process.env.OFFLINE;

// uninstall global babel install
try {
  exec("npm uninstall -g babel");
} catch (err) {}

// get packages
var packages = [];
ls("packages/*").forEach(function (loc) {
  var name = path.basename(loc);
  if (name[0] === ".") return;

  var pkgLoc = __dirname + "/../packages/" + name + "/package.json";
  if (!fs.existsSync(pkgLoc)) return;

  var pkg = require(pkgLoc);
  packages.push({
    folder: name,
    pkg: pkg,
    name: pkg.name
  });
});

// create links
packages.forEach(function (root) {
  console.log(root.name);

  var nodeModulesLoc = "packages/" + root.folder + "/node_modules";
  mkdir("-p", nodeModulesLoc);

  packages.forEach(function (sub) {
    var valid = false;
    if (root.pkg.dependencies && root.pkg.dependencies[sub.name]) valid = true;
    if (root.pkg.devDependencies && root.pkg.devDependencies[sub.name]) valid = true;
    if (!valid) return;

    var linkSrc = "packages/" + sub.folder;
    var linkDest = nodeModulesLoc + "/" + sub.name;

    console.log("Linking", linkSrc, "to", linkDest);
    if (fs.existsSync(linkDest)) fs.unlinkSync(linkDest);
    ln("-s", linkSrc, linkDest);
  });

  cd("packages/" + root.folder);

  // check whether or not we have any dependencies in our package.json that aren't in node_modules
  var shouldRunInstall = false;
  var pkg = require(process.cwd() + "/package.json");
  var deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {}));
  deps.forEach(function (depName) {
    if (!fs.existsSync(process.cwd() + "/node_modules/" + depName)) {
      console.log("Not installed", depName);
      shouldRunInstall = true;
    }
  });
  if (shouldRunInstall && !OFFLINE) exec("npm install");

  if (!OFFLINE) exec("npm link");

  cd("../..");
});

if (!OFFLINE) exec("make build");

/**
 * @namespace util
 */
var request = require("superagent");

/**
 * @author Anthony Pizzimenti
 * @desc Checks the value of the current window location with the desired path.
 * @memberof util
 * @param {string} path Desired path.
 * @returns {boolean} Is the provided path the same as the current window location?
 */
function checkPath(path) {
    return "/" + path === window.location.pathname;
}

/**
 * @author Anthony Pizzimenti
 * @desc Avoids checking authentication while still loading everything.
 * @memberof util
 * @param {*} u Dummy variable.
 * @returns {undefined}
 */
function u(u) { +u; }

/**
 * @author Anthony Pizzimenti
 * @desc When the page at /<path> loads, load the header, and call the callback.
 * @memberof util
 * @param {string} path Desired path.
 * @param {function} callback Called when all DOM content has loaded.
 * @param {function} errorCallback Called if there is an error loading content or the path is incorrect.
 * @returns {undefined}
 */
function onLoad(path, callback, errorCallback) {
    document.addEventListener("DOMContentLoaded", function(e) {
        // First, inject the header in *all* si
        if (checkPath(path) || path == "isPost" || path == "isEditor") injectHeader();
        if (path == "isPost" || path == "isEditor") checkAuth(callback);
        else if (checkPath(path)) checkAuth(callback);
        else if (errorCallback) errorCallback();
    });
}

/**
 * @author Anthony Pizzimenti
 * @desc Stores the user object in session storage to retain login.
 * @memberof util
 * @param {object} user A google user object.
 * @returns {undefined}
 */
function storeUser(user) {
    sessionStorage.setItem("user", user);
}

/**
 * @author Anthony Pizzimenti
 * @desc Checks if there's a user logged in (for the current session).
 * @memberof util
 * @param {function} callback Called if there's a user logged in.
 * @return {undefined}
 */
function checkAuth(callback) {
    var user = sessionStorage.getItem("user");

    // check for a logged-in user and update the header appropriately
    cosmetics(user);
    
    /*
    if:
        1. there's a user and a callback: we're successfully logged in,
        so call the callback
        2. there's a callback but no user: we aren't logged in!
        3. otherwise, do nothing
    */
    if (user && callback) callback(user);
    else if (callback) callback(false);
}

/**
 * @author Anthony Pizzimenti
 * @desc Applies cosmetic changes to the header.
 * @memberof util
 * @param {object|null} user A stored User object if we're logged in, null otherwise.
 * @returns {undefined}
 */
function cosmetics(user) {
    editorButton(user);
    if (user) createLogoutButton();
}

/**
 * @author Anthony Pizzimenti
 * @desc Replaces the "Log In" link with a "Log Out" link if there's a user logged in.
 * @memberof util
 * @returns {undefined}
 */
function createLogoutButton() {
    var login = document.getElementById("login");
    login.href="javascript:;";
    login.innerText = "Log Out";

    login.addEventListener("click", function() {
        logout(function(res) {
            if (res) {
                sessionStorage.removeItem("user");
                window.location.reload();
            } else window.alert("Couldn't be logged out.");
        });
    });
}

/**
 * @author Anthony Pizzimenti
 * @desc Displays the Editor button when a user is logged in.
 * @memberof util
 * @param {object|boolean} loggedIn An object if there's a user logged in, false if there isn't.
 * @returns {undefined}
 */
function editorButton(loggedIn) {
    var editor = document.getElementById("editor-link");
    if (loggedIn) editor.style.display = "inline-block";
    else editor.style.display = "none";
}

/**
 * @author Anthony Pizzimenti
 * @desc Logs out a user.
 * @memberof util
 * @param {function} callback Called when the request to /api/logout returns.
 * @returns {undefined}
 */
function logout(callback) {
    request
        .get("/api/logout/")
        .end(function(err, res) {
            callback(res);
        });
}

/**
 * @author Anthony Pizzimenti
 * @desc Injects header HTML into each page.
 * @memberof util
 * @returns {undefined}
 */
function injectHeader() {
    var body = Array.from(document.getElementsByTagName("body"))[0],
        child = document.createElement("div"),
        html = `
            <h1>exercise to the reader</h1>
            <h4>A math + computer science + politics + ... + anything blog.</h4>
            <ul id="menu">
                <li class="listitem"><a href="/">Home</a></li>
                <li class="listitem"><a href="/contact">Contact</a></li>
                <li class="listitem"><a href="/posts">Posts</a></li>
                <li class="listitem" id="editor-link"><a href="/editor">Editor</a></li>
                <li class="listitem"><a id="login" href="/login">Log In</a></li>
            </ul>
        `;
    
    // Set the proper id on the child node, append it to the body, and we're
    // good to go.
    child.id = "header";
    child.innerHTML = html;
    body.prepend(child);
}

module.exports = {
    checkAuth: checkAuth,
    checkPath: checkPath,
    onLoad: onLoad,
    storeUser: storeUser,
    createLogoutButton: createLogoutButton,
    u: u
};

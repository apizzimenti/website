
var path = require("path"),
    db = require("./db");

function routes(app) {
    var Posts = new db.Posts(),
        Auth = new db.Auth(),

        // actual pages
        index = path.resolve(__dirname, "../www/pages/index.html"),
        loginPage = path.resolve(__dirname, "../www/pages/login.html"),
        editor = path.resolve(__dirname, "../www/pages/editor.html"),
        
        // page(s) for website
        indexUrl = app.route("/"),
        loginUrl = app.route("/login"),
        editorUrl = app.route("/editor"),

        // api
        allPosts = app.route("/api/posts"),
        onePost = app.route("/api/posts/:id"),
        savePost = app.route("/api/posts/save"),

        login = app.route("/api/login"),
        loggedIn = app.route("/api/loggedIn");

    indexUrl.get(function (req, res) {
        res.sendFile(index);
    });

    loginUrl.get(function (req, res) {
        res.sendFile(loginPage);
    });

    editorUrl.get(function (req, res) {
        res.sendFile(editor);
    });

    allPosts.get(function (req, res) {
        Posts.getAll(function (snapshot) {
            var titles = [],
                keys = [],
                post;

            snapshot.forEach(function (postSnapshot) {
                post = postSnapshot.val();
                titles.push(post.title);
                keys.push(postSnapshot.key);
            });

            res.send({
                titles: titles,
                keys: keys
            });
        });
    });

    onePost.get(function (req, res) {
        Posts.get(req.params.id, function (data) {
            res.send(data);
        });
    });

    savePost.post(function (req, res) {
        Posts.save(req.body);
    });

    login.post(function (req, res) {
        Auth.login(req.body.username, req.body.password,
            function (err) {
                res.status(403).send(err);
            },
            function (data) {
                res.status(200).send(data);
            }
        );
    });

    loggedIn.get(function (req, res) {
        Auth.isLoggedIn(function (user) {
            if (user)
                res.send(true);
            else
                res.send(false);
        });
    });
}

module.exports = routes;
/*global require, console, __dirname, process */
(function () {
    "use strict";
    var express = require("express"),
        app = express(),
        http = require("http").Server(app),
        io = require("socket.io")(http),
        bodyParser = require("body-parser"),
        cP = require("cookie-parser"),
        session = require('express-session'),

        SESSION_NAME = "humprsid",
        SESSION_SECRET = Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36) + Math.random().toString(36),
        PORT = process.env.PORT || 5000,

        cookieParser = cP(SESSION_SECRET),
        sessionStore = new session.MemoryStore();

    app.use(
        bodyParser()
    ).use(
        cookieParser
    ).use(
        session({
            store: sessionStore,
            name: SESSION_NAME
        })
    ).use(
        express.static(__dirname + '/public')
    ).get("/", function (req, res) {
        res.sendfile("index.html");
    }).post('/login', function (req, res) {
        if (req.param("username") && req.param("password") === "humpe") {
            req.session.username = req.param("username");
            res.json({
                status: "ok"
            });
        } else {
            res.json({
                status: "not ok"
            });
        }
    }).get("/check", function (req, res) {
        if (req.session.username) {
            res.json({
                status: "ok"
            });
        } else {
            res.send(403, "Not signed in.");
        }
    });

    http.listen(PORT, function () {
        console.log("Listening on *:" + PORT);
    });

    io.set('authorization', function (data, callback) {
        if (!data.headers.cookie) {
            return callback('No cookie transmitted.', false);
        }

        cookieParser(data, {}, function (parseError) {
            if (parseError) {
                return callback('Error parsing cookie.', false);
            }

            var sessionCookie = (data.secureCookies && data.secureCookies[SESSION_NAME]) ||
                (data.signedCookies && data.signedCookies[SESSION_NAME]) ||
                (data.cookies && data.cookies[SESSION_NAME]);

            sessionStore.load(sessionCookie, function (error, session) {
                if (error || !session || !session.username) {
                    return callback("Not logged in. (" + error + ")", false);
                }

                data.username = session.username;
                return callback(null, true);
            });
        });

        return callback('Not logged in.', false);
    }).on("connection", function (socket) {
        var username = socket.client.request.username;

        io.emit("msg", {
            msg: username + " has connected.",
            username: "System"
        });

        socket.on("disconnect", function () {
            io.emit("msg", {
                msg: username + " has disconnected.",
                username: "System"
            });
        });

        socket.on("msg", function (msg) {
            io.emit("msg", {
                msg: msg,
                username: username
            });
        });
    });

}());
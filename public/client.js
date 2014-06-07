/*global io, $ */
(function () {
    "use strict";

    var //socket = io(),
        content = $("#content"),
        chat = function () {
            $.ajax("/chat").done(function (response) {
                content.html(response);

                var messages = $('#messages'),
                    socket = io();

                    socket.on("msg", function (response) {
                        messages.append($('<li>').text(response.username + ": " + response.msg));
                    }).on("connect", function() {
                        messages.append($('<li>').text("Connected to server."));
                    });

                var form = $("form"),
                    input = $(form).find("input");

                form.submit(function () {
                    var msg = input.val();

                    if (msg) {
                        socket.emit("msg", msg);
                        input.val("");
                    }
                    return false;
                });
            }).error(function () {
                alert("Unable to load chat page.");
            });
        },
        login = function () {
            $.ajax("/login").done(function (response) {
                content.html(response);
                var form = $("form");

                form.submit(function () {
                    $.ajax({
                        type: "POST",
                        url: "/login",
                        data: form.serialize()
                    }).done(function (response) {
                        if (response.status === "ok") {
                            chat();
                        } else {
                            alert("Invalid login!");
                        }
                    });

                    return false;
                });
            }).error(function () {
                alert("Unable to load login page.");
            });
        };

    login();
}());

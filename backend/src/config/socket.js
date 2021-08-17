import config from './config.js';
import User from '../schemas/UserSchema.js';
import {Server} from 'socket.io'

export default function (app, server) {
    const io = new Server({
        cors: {
            origin: config.cors.origin || 'http://localhost:3000',
            methods: ["GET", "POST", "PATCH"],
            credentials: true
        }
    });

    app.set('io', io);

    io.on("connection", (socket) => {
        socket.on("userConnect", (id) => {
            User
                .findById(id)
                .then((user) => {
                    if (user) {
                        socket.join(user._id.toString());
                        console.log('Client connected.');
                    }
                })
                .catch((e) => {
                    console.log('Invalid user ID, cannot join Socket.');
                });
        });

        socket.on("userDisconnect", (userID) => {
            socket.leave(userID);
            console.log('Client Disconnected.');
        });

        socket.on("onFollowUser", (data) => {
            console.log(data);
        });

        socket.on("user-typing", ({ user, state }) => {
            io.to(user.id).emit("typing", state)
        })

        socket.on("disconnect", () => {
            console.log('Client disconnected');
        });
    });
}
// Holden Ernest - 5/20/2025
// Controls the interaction socket between the clients and the server
import { pushNotification, updateWithNewItem } from './clientList.js';
const socket = io();
socket.on("connect", () => {
    console.log("connected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("connected");
    statusElement?.classList.remove("disconnected");
    if (statusElement)
        statusElement.innerHTML = "⠇";
    //* join the group that coorisponds with this list
    joinGroup();
});
socket.on("disconnect", () => {
    console.log("disconnected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("disconnected");
    statusElement?.classList.remove("connected");
    if (statusElement)
        statusElement.innerHTML = "⠄"; //⚠ ⠇⠄
});
export function sendListItemToServer(item) {
    console.log("sending to server: ", item);
    socket.emit('save-listItem', item);
}
socket.on('update-listItem', (recieved) => {
    console.log("recieving updated item! " + recieved);
    updateWithNewItem(recieved["item"]);
});
socket.on('push-noti', (notification) => {
    console.log("recieving notification " + notification);
    pushNotification(notification);
});
function joinGroup() {
    console.log("joining group");
    socket.emit("join_group");
}

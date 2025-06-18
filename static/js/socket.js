// Holden Ernest - 5/20/2025
// Controls the interaction socket between the clients and the server
import { pushNotification, updateRemovedItem, updateWithNewItem } from './clientList.js';
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
    socket.emit('save-listItem', item);
}
export function removeItemFromServer(item) {
    console.log("SENDING: remove item");
    socket.emit('remove-listItem', item);
}
export function importList(owner, listname, file) {
    file.text().then((value) => {
        if (file.size > 1000000)
            return; //TODO: file size too large noti?
        const sendObj = { owner: owner, listname: listname, file: { name: file.name, type: file.type, size: file.size, content: value } };
        console.log("SENDING: " + value);
        socket.emit('import-list', sendObj);
    });
}
socket.on('update-listItem', (recieved) => {
    updateWithNewItem(recieved["item"]);
});
socket.on('update-remove', (recieved) => {
    console.log("trying to remove an item from web");
    updateRemovedItem(recieved["item"]);
});
socket.on('push-noti', (notification) => {
    console.log("recieving notification " + notification);
    pushNotification(notification);
});
function joinGroup() {
    console.log("joining group");
    socket.emit("join_group");
}

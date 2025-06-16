// Holden Ernest - 5/20/2025
// Controls the interaction socket between the clients and the server

import { listItem, listItemExtended, notificaiton, pushNotification, updateRemovedItem, updateWithNewItem } from './clientList.js';


declare const io: any;  // This tells TypeScript that 'io' exists globally
const socket = io();

socket.on("connect", () => {
    console.log("connected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("connected");
    statusElement?.classList.remove("disconnected");
    if (statusElement) statusElement.innerHTML = "⠇";

    //* join the group that coorisponds with this list
    joinGroup();
});

socket.on("disconnect", () => {
    console.log("disconnected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("disconnected");
    statusElement?.classList.remove("connected");
    if (statusElement) statusElement.innerHTML = "⠄"; //⚠ ⠇⠄
});

export function sendListItemToServer(item: listItemExtended): void {
    socket.emit('save-listItem', item);
}
export function removeItemFromServer(item: listItemExtended): void {
    console.log("SENDING: remove item")
    socket.emit('remove-listItem', item);
}

socket.on('update-listItem', (recieved: {[keys: string]: listItemExtended}) => {
    updateWithNewItem(recieved["item"])
});

socket.on('update-remove', (recieved: {[keys: string]: listItemExtended}) => {
    console.log("trying to remove an item from web")
    updateRemovedItem(recieved["item"])
});

socket.on('push-noti', (notification: notificaiton) => {
    console.log("recieving notification " + notification)
    pushNotification(notification)
});

function joinGroup(): void {
    console.log("joining group");
    socket.emit("join_group");
}
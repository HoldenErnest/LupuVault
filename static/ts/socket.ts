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

export function importList(owner:string, listname:string, file: File): void {
    file.text().then((value) => {
        if (file.size > 1000000) return; //TODO: file size too large noti?
        const sendObj = {owner:owner, listname:listname, file:{name: file.name, type: file.type, size: file.size, content: value}}
        console.log("SENDING: " + value)
        socket.emit('import-list', sendObj);

    })
}

export function removeList(owner:string, listname:string): void {
    socket.emit('remove-list', owner, listname);
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

export function joinGroup(): void {
    console.log("joining group");
    socket.emit("join_group");
}
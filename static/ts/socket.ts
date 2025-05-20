// Holden Ernest - 5/20/2025
// Controls the interaction socket between the clients and the server

import { addChange, listItem } from './clientList.js';


declare const io: any;  // This tells TypeScript that 'io' exists globally
const socket = io();

socket.on("connect", () => {
    console.log("connected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("good");
    statusElement?.classList.remove("bad");
    if (statusElement) statusElement.innerHTML = "Connected";

    //* join the group that coorisponds with this list
    joinGroup();
});

socket.on("disconnect", () => {
    console.log("disconnected");
    const statusElement = document.getElementById("connection_status");
    statusElement?.classList.add("bad");
    statusElement?.classList.remove("good");
    if (statusElement) statusElement.innerHTML = "Disconnected";
});

export function sendListItemToServer(item: listItem): void {
    console.log("sending to server: ", item);
    socket.emit('save-listItem', item);
}

socket.on('update-listItem', (item: listItem) => {
    addChange(item)
    console.log("recieving updated item! " + item)
});

function joinGroup(): void {
    console.log("joining group");
    socket.emit("join_group");
}
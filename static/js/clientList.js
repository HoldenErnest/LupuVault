// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page
import * as socket from './socket.js';
var currentListItems = [];
var currentListName = "";
var currentListOwner = "";
var changes = {};
export function addChange(item) {
    changes[item.itemID.toString()] = item;
}
export function removeChange(itemID) {
    delete changes[itemID.toString()];
}
/**
 * Updates the UI from a change (most likely recieved from the socket)
 * @param item the list item with the changes
 */
export function updateFromChange(item) {
    console.log("recieved " + item + " from the server, and making UI changes");
}
/**
 * Saves the given list item to the server.
 */
export function pushListItem(item) {
    socket.sendListItemToServer(item);
}
/**
 * Push all changes to the server through the socket
 */
export function pushAllChanges() {
    //! temp
    addChange({ itemID: 1, owner: "jim", listname: "list", title: "titlesthign" });
    for (var key in changes) {
        pushListItem(changes[key]);
        removeChange(key);
    }
}
function toDateTime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

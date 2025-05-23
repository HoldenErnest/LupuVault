// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page
import * as socket from './socket.js';
import * as UI from './listInterface.js';
const whoAmI = document.getElementById("initWhoAmI").value;
var currentListName = document.getElementById("initListList").value;
var currentListOwner = document.getElementById("initListUser").value;
var changes = {};
var newItemID = -1; // give a temporary identification to each new item.
init();
async function init() {
    await requestAllAccessableLists();
    await requestOpenList(currentListOwner, currentListName);
}
/**
 * Trys open list
 * @param url a link to the json from the API
 */
export async function requestOpenList(user, listname) {
    console.log("OPENING: lists/" + user + "/" + listname);
    //TODO: start loading ". . ." animation
    var listItems = await downloadAPI("lists/" + user + "/" + listname);
    //TODO: end loading animation
    var listData = listItems;
    openList(user, listname, listData);
}
export function removeList(params) {
    //TODO: Not Urgent.. delete list if you own this (including the guests)
}
function openList(owner, listname, listData) {
    currentListName = listname;
    currentListOwner = owner;
    clearAllChanges();
    UI.displayListItems(listData);
    //TODO: refresh UI
}
export async function requestAllAccessableLists() {
    var allLists = await downloadAPI("lists");
}
/**
 * Virtually creates a new list (any future saves will be sent as this new list)
 */
export function createNewList(listname) {
    openList(whoAmI, listname, []);
}
async function downloadAPI(path) {
    const url = "/api/" + path;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    }
    catch (error) {
        console.error(error.message);
        //TODO: better error when fetch fails
        return [];
    }
}
/**
 * Creates a new list item with an id so the user can edit it
 */
export function requestNewListItem() {
    return { itemID: newItemID-- };
}
/**
 * Add to the list of all changes
 * @param item a partially completed item with only the changes listed
 */
export function addChange(item) {
    var newItem = item;
    if (item.itemID.toString() in changes) {
        // if a previous change was stored, merge the two (with prefrence for the new item)
        var oldItem = changes[item.itemID.toString()];
        newItem = mergeItems(oldItem, item);
    }
    changes[item.itemID.toString()] = newItem;
}
function removeChange(itemID) {
    delete changes[itemID.toString()];
}
function mergeItems(oldItem, newValues) {
    return Object.assign(oldItem, newValues);
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
    //* before you send any new items (these are items with a negative ID):
    //TODO: if (-id) Tell the listInterface to delete this item.
    var exportItem = item; //! is this a correct line?
    exportItem.owner = currentListOwner;
    exportItem.listname = currentListName;
    //TODO: if (-id): remove the id completely
    socket.sendListItemToServer(exportItem);
}
/**
 * Push all changes to the server through the socket
 */
export function pushAllChanges() {
    //! temp
    addChange({ itemID: 2, title: "this is an old title (dont show)", notes: "some notes (untouched?)" });
    addChange({ itemID: -2, title: "This is a new item", rating: 3 });
    addChange({ itemID: 2, title: "this is a better title" });
    //! temp
    for (var key in changes) {
        pushListItem(changes[key]);
        removeChange(key);
    }
}
function clearAllChanges() {
    changes = {};
}
function toDateTime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

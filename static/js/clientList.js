// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page
import * as socket from './socket.js';
import * as UI from './listInterface.js';
const whoAmI = document.getElementById("initWhoAmI").value;
var currentListName = document.getElementById("initListList").value;
var currentListOwner = document.getElementById("initListUser").value;
var changes = {};
var newItemID = -1; // give a temporary identification to each new item.
var allItems = {}; //TODO: remove this? not needed
init();
async function init() {
    requestAllAccessableLists();
    requestOpenList(currentListOwner, currentListName);
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
    setupListDict(listData);
    updateUIFromDict();
}
async function requestAllAccessableLists() {
    var listPacked = await downloadAPI("lists");
    var allLists = [];
    listPacked.forEach(listInfo => {
        allLists.push({
            "owner": listInfo[0],
            "listname": listInfo[1],
        });
    });
    UI.displayAvailableLists(allLists);
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
export function updateWithNewItem(item) {
    UI.displayItemChange(item);
}
function setupListDict(list) {
    allItems = {};
    list.forEach(item => {
        allItems[item.itemID.toString()] = item;
    });
}
function updateUIFromDict() {
    UI.displayList(Object.values(allItems));
}
export function pushNotification(noti) {
    displayNotification(noti.status, noti.message);
}
/**
 * Saves the given list item to the server.
 */
export function pushListItem(item) {
    //* before you send any new items (these are items with a negative ID):
    //TODO: if (-id) Tell the listInterface to delete this item.
    var exportItem = item;
    exportItem.owner = currentListOwner;
    exportItem.listname = currentListName;
    if (exportItem.date)
        exportItem.date = toDateTime(new Date(exportItem.date));
    //TODO: if (-id): remove the id completely
    socket.sendListItemToServer(exportItem);
}
/**
 * Push all changes to the server through the socket
 */
export function pushAllChanges() {
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

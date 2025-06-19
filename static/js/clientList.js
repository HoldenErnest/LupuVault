// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page
import * as socket from './socket.js';
import * as UI from './listInterface.js';
const whoAmI = document.getElementById("initWhoAmI").value;
var currentListName = document.getElementById("initListList").value;
var currentListOwner = document.getElementById("initListUser").value;
var changes = {};
var newItemID = -1; // give a temporary identification to each new item.
var allLists = [];
var allItems = {}; //TODO: remove this? not needed
init();
async function init() {
    requestAllAccessableLists();
    requestOpenList(currentListOwner, currentListName);
}
/**
 * Request an image from the api with the given search
 * @param imgQuery
 */
export async function requestImageUrls(imgQuery) {
    var whichList = getCurrentListDef();
    console.log("REQUEST");
    var urls = await downloadAPI("img/" + imgQuery);
    console.log("RECIEVED");
    var sameList = getCurrentListDef();
    if (whichList.owner != sameList.owner || whichList.listname != sameList.listname)
        return false; // the list changed since it asynchronously responded.
    return urls;
}
/**
 * Trys open list
 * @param url a link to the json from the API
 */
export async function requestOpenList(user, listname) {
    console.log("OPENING: lists/" + user + "/" + listname);
    UI.startLoading();
    var listItems = await downloadAPI("lists/" + user + "/" + listname);
    UI.endLoading();
    var listData = listItems;
    openList(user, listname, listData);
}
export function removeList(owner, listname) {
    console.log("trying to remove " + listname + " by " + owner);
    socket.removeList(owner, listname);
}
function openList(owner, listname, listData) {
    currentListName = listname;
    currentListOwner = owner;
    clearAllChanges();
    setupListDict(listData);
    updateUIFromDict();
    socket.joinGroup();
}
async function requestAllAccessableLists() {
    var listPacked = await downloadAPI("lists");
    listPacked.forEach(listInfo => {
        allLists.push({
            "owner": listInfo[1],
            "listname": listInfo[0],
        });
    });
    console.log("current list:: " + currentListName);
    UI.displayAvailableLists(allLists, getCurrentListDef());
}
/**
 * Virtually creates a new list (any future saves will be sent as this new list)
 */
export function createNewList(listname, importFile) {
    if (importFile) {
        socket.importList(whoAmI, listname, importFile);
    }
    // client side using this list
    openList(whoAmI, listname, []);
    allLists.push({ owner: whoAmI, listname: listname });
    UI.displayAvailableLists(allLists, getCurrentListDef());
}
export function listNameExists(listname) {
    for (var listInfo of allLists) {
        console.log(listInfo.listname + "=?" + listname);
        if (listname == listInfo.listname && listInfo.owner == whoAmI)
            return true;
    }
    return false;
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
    if (item.listname != currentListName || item.owner != currentListOwner)
        return;
    UI.displayItemChange(item);
}
export function updateRemovedItem(item) {
    if (item.listname != currentListName || item.owner != currentListOwner)
        return;
    UI.removeByID(item.itemID);
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
    var exportItem = item;
    exportItem.owner = currentListOwner;
    exportItem.listname = currentListName;
    if (exportItem.date)
        exportItem.date = toDateTime(new Date(exportItem.date));
    if (Object.keys(item).length == 3) { // REMOVE // owner, listname, id
        if (item.itemID < 0)
            return; // ignore this if youre removing a new item
        socket.removeItemFromServer(exportItem);
        return;
    }
    // before sending new items (-id), remove them from the UI
    if (item.itemID < 0)
        UI.removeByID(item.itemID);
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
function getCurrentListDef() {
    return { owner: currentListOwner, listname: currentListName };
}

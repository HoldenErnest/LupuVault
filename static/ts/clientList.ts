// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page

import * as socket from './socket.js';


var currentListName:string = ""
var currentListOwner:string = ""

var changes:{[keys: string]: listItem} = {}

var newItemID = -1; // give a temporary identification to each new item.

export type listItem = {
    "itemID": number,
    "title"?: string,
    "notes"?: string,
    "rating"?: number,
    "tags"?: string,
    "date"?: string,
    "imageURL"?: string
}
export interface listItemExport extends listItem {
    "owner": string,
    "listname": string,
}


/**
 * Trys open list
 * @param url a link to the json from the API
 */
export function requestOpenList(url: string) {
    //TODO: fetch the json object, update some things..
    var listData: listItem[] = [];
    var owner: string = "";
    var listname: string = "";
    openList(owner, listname, listData);
}

function openList(owner: string, listname: string, listData: listItem[]) {
    currentListName = listname;
    currentListOwner = owner;
    //TODO: clear all changes
    //TODO: refresh UI
}


/**
 * Creates a new list item with an id so the user can edit it
 */
export function requestNewListItem(): listItem {
    return {itemID: newItemID--};
}


/**
 * Add to the list of all changes
 * @param item a partially completed item with only the changes listed
 */
export function addChange(item: listItem) {
    var newItem = item;
    if (item.itemID.toString() in changes) {
        // if a previous change was stored, merge the two (with prefrence for the new item)
        var oldItem = changes[item.itemID.toString()]
        newItem = mergeItems(oldItem, item)
    }
    changes[item.itemID.toString()] = newItem;
}
function removeChange(itemID: number | string) {
    delete changes[itemID.toString()]
}
function mergeItems(oldItem: listItem, newValues: listItem): listItem {
  return Object.assign(oldItem, newValues);
}


/**
 * Updates the UI from a change (most likely recieved from the socket)
 * @param item the list item with the changes
 */
export function updateFromChange(item: listItem) {
    console.log("recieved " + item + " from the server, and making UI changes");
}

/**
 * Saves the given list item to the server.
 */
export function pushListItem(item: listItem) {
    //* before you send any new items (these are items with a negative ID):
    //TODO: if (-id) Tell the listInterface to delete this item.
    var exportItem: listItemExport = item as listItemExport //! is this a correct line?
    exportItem.owner = currentListOwner;
    exportItem.listname = currentListName;
    //TODO: if (-id): remove the id completely
    socket.sendListItemToServer(exportItem)
}

/**
 * Push all changes to the server through the socket
 */
export function pushAllChanges() {
    //! temp
    addChange({itemID: 1, title: "titlesthign"})
    for (var key in changes) {
        pushListItem(changes[key])
        removeChange(key)
    }
}

function toDateTime(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}
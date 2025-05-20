// Holden Ernest - 5/20/2025
// Holds information on what should be rendered on the main list page

import * as socket from './socket.js';

var currentListItems:listItem[] = []
var currentListName:string = ""
var currentListOwner:string = ""

var changes:{[keys: string]: listItem} = {}

export type listItem = {
    "itemID": number,
    "owner": string,
    "listname": string,
    "title": string,
    "notes": string,
    "rating": number,
    "tags": string[],
    "date": Date,
    "imageURL": string
}


export function addChange(item: listItem) {
    changes[item.itemID.toString()] = item;
}
export function removeChange(itemID: number | string) {
    delete changes[itemID.toString()]
}
export function updateFromChange(item: listItem) {

}

/**
 * Saves the given list item to the server.
 */
export function pushListItem(item: listItem) {
    socket.sendListItemToServer(item)
}

/**
 * Push all changes to the server through the socket
 */
export function pushAllChanges() {
    for (var key in changes) {
        pushListItem(changes[key])
        removeChange(key)
    }
}
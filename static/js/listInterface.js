// Holden Ernest - 1/11/2024
// Interface for the DOM. Sends information to clientList.ts
import * as clientList from "./clientList.js";
const loadListBtn = document.getElementById("load-list");
const searchbar = document.getElementById("searchbar");
const escapeFocusElem = document.getElementById("escape-focus");
const sortBtn = document.getElementById("sort-list");
const parentOfList = document.getElementById('list-items');
//Event listeners
//saveBtn.addEventListener('click', onButtonSave);
//loadListBtn.addEventListener('click', loadList);
searchbar.addEventListener('input', updateSearch);
//document.getElementById("sort-list")!.onchange = sort_all;
//document.getElementById("sort-order")!.onchange = sort_all;
document.getElementById("save-btn").onclick = saveChanges;
document.getElementById("add-item-btn").onclick = newItem;
//document.getElementById("new-list-button")!.onclick = newList;
//document.getElementById("sort-order")!.onclick = toggleAscendingSort;
var sortOrder = 1;
var tagsDictionary = {}; // keeps track of how many times this tag was used
var hasNewItem = false;
var madeChange = false;
function saveChanges() {
    clientList.pushAllChanges();
}
function updateSearch() {
    var searched = searchbar.value;
    if (searched == "") {
        showAllItems();
        return;
    }
    // find any tag or rating searches within this string
    const ratingEx = /\d{1,2}\/10/;
    var searchRegex = ratingEx.exec(searched);
    var searchRating = null;
    const tagsEx = /#\w+/g;
    var searchTags = searched.match(tagsEx); // to get an array of multiple, you need to use match
    // remove the other searched terms from the title search
    if (searchRegex) {
        searched = searched.replace(ratingEx, "");
        // remove the '/10'
        searchRating = (searchRegex[0]).substring(0, searchRegex[0].length - 3);
    }
    if (searchTags)
        searched = searched.replace(tagsEx, "");
    searched = searched.replace(/\s+/g, ' '); // remove all extraneous spaces from the title / clean it up
    searched = searched.replace("#", '');
    searched = searched.trim();
    if (searched == "")
        searched = null;
    // loop through all DOM items (except the placeholder one)
    var items = Array.from(document.getElementsByClassName("item"));
    if (!items || items.length <= 1) {
        console.error("there are no items?");
        return;
    }
    for (let i = 1; i < items.length; i++) {
        // Item components
        let theItemTitle = items[i].getElementsByClassName("item-title")[0].innerHTML.toLowerCase();
        let theItemRating = items[i].getElementsByClassName("item-rating")[0].innerHTML.toLowerCase();
        let theItemTags = items[i].getElementsByClassName("item-tags")[0].innerHTML.toLowerCase();
        // test if the item has your search
        let hasSearchedTitle = (!searched || theItemTitle.includes(searched.toLowerCase()));
        let hasSearchedRating = (!searchRating || theItemRating == searchRating);
        let hasSearchedTags = () => {
            if (!searchTags)
                return true;
            for (let i = 0; i < searchTags.length; i++) { // if any of the searched tags arent in the item, hide it
                searchTags[i] = searchTags[i].replace("#", "");
                if (!theItemTags.toLowerCase().includes(searchTags[i].toLowerCase()))
                    return false;
            }
            return true;
        };
        if (hasSearchedTitle && hasSearchedRating && hasSearchedTags()) {
            items[i].style.display = 'block';
        }
        else {
            items[i].style.display = 'none';
        }
    }
}
function focusSearch() {
    if (searchbar.value)
        searchbar.value = "";
    searchbar.focus();
}
function showAllItems() {
    var items = document.getElementsByClassName("item");
    // skip the placeholder item
    for (let i = 1; i < items.length; i++) {
        items[i].style.display = 'block';
    }
}
function removeAllItems() {
    let allItems = document.querySelectorAll('#list-items .item');
    Array.from(allItems).forEach((item) => {
        item.remove();
    });
}
/**
 * Sorts all Items based on the sort order
 */
function sort_all() {
    var toSortTmp = document.getElementById('list-items').children;
    var toSort = Array.prototype.slice.call(toSortTmp, 0);
    toSort.sort(function (a, b) {
        let nameA = a.getElementsByClassName(`item-${sortBtn.value}`)[0].innerHTML.toLowerCase();
        let nameB = b.getElementsByClassName(`item-${sortBtn.value}`)[0].innerHTML.toLowerCase();
        if (sortBtn.value == "rating") {
            nameA = parseInt(nameA);
            nameB = parseInt(nameB);
        }
        else if (sortBtn.value == "date") {
            nameA = Date.parse(nameA) || 0;
            nameB = Date.parse(nameB) || 0;
        }
        if (nameA < nameB)
            return -sortOrder;
        if (nameA > nameB)
            return sortOrder;
        return 0;
    });
    var parent = document.getElementById('list-items');
    parent.innerHTML = "";
    for (var i = 0, l = toSort.length; i < l; i++) {
        parent.appendChild(toSort[i]);
        toSort[i].getElementsByClassName("item-id")[0].innerHTML = i + 1;
    }
}
/**
 * Add any tags to make sure theyre included in the dictionary of all found tags
 * @param tagsString
 */
function addTags(tags) {
    tags.forEach((tag) => {
        if (tag)
            tagsDictionary[tag] = tagsDictionary[tag] + 1 || 1;
    });
    /* // Display the keys
    console.log("\n\n::");
    Object.keys(tagsDictionary).forEach( (key) => {
        console.log(key + ":" + tagsDictionary[key] + "\n");
    });*/
}
function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
}
function updateImage(theItemImage, url) {
    theItemImage.style.background = `linear-gradient(to left, transparent, #222), url("${url}")`;
    theItemImage.style.backgroundRepeat = "no-repeat";
    theItemImage.style.backgroundSize = "cover";
    theItemImage.style.backgroundPosition = "center";
}
/**
 * Displays list items as elements
 * @param listData
 */
function displayListItems(listData) {
    let itemCount = document.querySelectorAll('#list-items .item').length + 1;
    for (let i = 0; i < listData.length; i++) {
        displayListItem(listData[i], itemCount + i);
    }
    sort_all();
}
function displayListItem(itemData, itemID) {
    var original = document.getElementById('placeholder-item');
    if (original == null)
        return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.id = '';
    clone.classList.remove("placeholder");
    // set all of these clones child divs to use the listItem information
    clone.getElementsByClassName("item-id")[0].innerHTML = itemID.toString() || document.querySelectorAll('#list-items .item').length.toString(); // if an id is passed in use that (might be unnessecary if the selector is efficient)
    clone.getElementsByClassName("item-title")[0].innerHTML = itemData.title;
    clone.getElementsByClassName("item-tags")[0].innerHTML = itemData.tags.toString();
    addTags(itemData.tags.split(" "));
    clone.getElementsByClassName("item-rating")[0].innerHTML = itemData.rating.toString();
    clone.getElementsByClassName("item-notes")[0].innerHTML = itemData.notes;
    clone.getElementsByClassName("item-date")[0].innerHTML = itemData.date.toString();
    if (itemData.imageURL) { // if it has a unique image url, make sure to update it
        updateImage(clone.querySelectorAll(".item-image div")[0], itemData.imageURL);
    }
    var parent = document.getElementById('list-items');
    parent.appendChild(clone);
}
/**
 * Create a new item from the placeholder
 * @returns
 */
function newItem() {
    console.log("thigs working");
    if (hasNewItem) {
        console.log("there is already an unsubmitted new Item");
        return;
    }
    ; // dont make a second new item
    hasNewItem = true;
    var original = document.getElementById('placeholder-item');
    if (original == null)
        return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.id = '';
    //! clone.dataset.value = "new"; // SET THIS TAG SO THINGS READING IT CAN ACT ON IT
    clone.getElementsByClassName("item-date")[0].innerHTML = (new Date()).toDateString().replace(/^\S+\s/, '');
    addItemEvents(clone);
    parentOfList.insertBefore(clone, parentOfList.firstChild); // place this new element at the top.
    editTitle(clone);
    addSubmitButton(clone);
}
/**
 * When you make a new item, have the id slot be for a submit button
 * @param anItem
 */
function addSubmitButton(anItem) {
    var theId = anItem.getElementsByClassName("item-id")[0];
    theId.style.backgroundColor = "#171";
    theId.onclick = function () {
        escapePress();
        anItem.dataset.value = ""; // UNSET THE "new" TAG
        // remove all events from the id
        this.onclick = null;
        this.onmouseenter = null;
        this.onmouseleave = null;
        this.style.backgroundColor = "transparent";
        sort_all();
        madeEdit(anItem);
        hasNewItem = false; // when youve saved this new item, make sure to allow other items to be created
    };
    theId.onmouseenter = function () {
        theId.style.backgroundColor = "#151";
    };
    theId.onmouseleave = function () {
        theId.style.backgroundColor = "#171";
    };
}
/**
 * anytime an item is changed, call this method to see if it will update save
 * @param anItem
 */
function madeEdit(anItem) {
    if (madeChange)
        return;
    if (anItem.dataset.value == "new")
        return;
    madeChange = true;
    //bring up the save menu if !madeChange
    showSaveButton();
}
function showSaveButton() {
    var saveBtn = document.getElementById("save-check");
    saveBtn.checked = true;
}
function hideSaveButton() {
    var saveBtn = document.getElementById("save-check");
    saveBtn.checked = false;
    madeChange = false;
    displayNotification("warning", "Changes discarded");
}
function escapePress() {
    escapeFocusElem.focus();
}
/**
 * Focus editing the title
 * @param anItem
 */
function editTitle(anItem) {
    var theTitle = anItem.getElementsByClassName("item-title")[0];
    var val = theTitle.innerHTML;
    var input = document.createElement("input");
    input.dataset.value = val;
    input.className = 'editable';
    input.onblur = function () {
        var val = this.dataset.value;
        theTitle.innerHTML = toTitleCase(val);
        /*
        madeEdit(anItem);
        sort_all();
        escapePress();
        */
    };
    theTitle.innerHTML = "";
    theTitle.appendChild(input);
    input.focus();
}
function toTitleCase(str) {
    if (!str)
        return "";
    return str[0].toUpperCase() + str.slice(1);
}
/**
 * Functions called after a new Item is added
 * @param anItem This is the item
 */
function addItemEvents(anItem) {
    anItem.getElementsByClassName("item-notes")[0].onchange = () => { madeEdit(anItem); };
    anItem.getElementsByClassName("delete-item")[0].addEventListener("click", function (evt) {
        removeItem(anItem); // remove this element if you delete
    });
    var linkButtons = anItem.getElementsByClassName("change-item-image")[0];
    for (let i = 1; i < linkButtons.children.length; i++) {
        linkButtons.children[i].addEventListener("click", function (evt) {
            requestImageUrl(anItem, i - 1); // << the event when you click an item image
        });
    }
    //clone.onclick = clickItem;
    makeEditable(anItem);
}
/**
 * Makes an Item editable, adding double click items
 * @param item
 */
function makeEditable(item) {
    var elementsList = ["title", "tags", "rating", "date"];
    elementsList.forEach(element => {
        item.getElementsByClassName(`item-${element}`)[0].ondblclick = function () {
            var thisElem = this;
            if (thisElem.childElementCount > 0)
                return;
            var val = thisElem.innerHTML;
            var input = document.createElement("input");
            input.value = val;
            input.alt = val;
            input.className = 'editable';
            switch (element) {
                case "title":
                    input.onblur = function () {
                        var val = thisElem.dataset.value;
                        thisElem.parentNode.innerHTML = toTitleCase(val);
                        if (thisElem.dataset.alt != val)
                            madeEdit(item);
                    };
                    break;
                case "tags":
                    input.onblur = function () {
                        var val = thisElem.dataset.value;
                        thisElem.parentNode.innerHTML = val;
                        if (thisElem.dataset.alt != val)
                            madeEdit(item);
                    };
                    break;
                case "rating":
                    input.style.width = "40px";
                    input.type = "number";
                    input.onblur = function () {
                        var val = Number(thisElem.dataset.value);
                        val = val > 10 ? 10 : val;
                        val = val < 0 ? 0 : val;
                        thisElem.parentNode.innerHTML = val.toString(); // = val | "0"; no idea why this works, but it truncates the 0s
                        if (Number(thisElem.dataset.alt) != val)
                            madeEdit(item);
                    };
                    break;
                case "date":
                    input.onblur = function () {
                        var val = thisElem.dataset.value;
                        val = isValidDate(val) ? new Date(val).toDateString().replace(/^\S+\s/, '') : new Date().toDateString().replace(/^\S+\s/, '');
                        thisElem.parentNode.innerHTML = val; // TODO: ternery current date
                        if (thisElem.dataset.alt != val)
                            madeEdit(item);
                    };
                    break;
            }
            thisElem.innerHTML = "";
            thisElem.appendChild(input);
            input.focus();
        };
    });
}
/**
 * Send a request to the server to fetch the image with googles api
 * @param anItem Item in which to change the image
 * @param urlNum Out of the list of x images, which one do they want
 */
function requestImageUrl(anItem, urlNum) {
    var searchText = anItem.getElementsByClassName("item-title")[0].innerHTML;
    if (!searchText) {
        console.log("nothing to search for, in requestImageUrl");
        return;
    }
    var lastImageEdit = anItem.querySelectorAll(".item-image div")[0];
    var lastImageNumber = urlNum;
    if (anItem.querySelectorAll(".item-image div")[0].dataset.value) {
        var urlString = anItem.querySelectorAll(".item-image div")[0].dataset.value;
        updateImage(lastImageEdit, urlString.split("\n")[lastImageNumber]);
        return;
    }
    //! window.api.send("get-urls", searchText);
    //TODO: setup an interaction to fetch the urls
}
/**
 * Remove an Item from the list
 * @param anItem
 */
function removeItem(anItem) {
    madeEdit(anItem);
    if (anItem.dataset.value == "new")
        hasNewItem = false;
    anItem.remove();
    sort_all();
}

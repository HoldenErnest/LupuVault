// Holden Ernest - 1/11/2024
// Interface for the DOM. Sends information to clientList.ts
import * as ClientList from "./clientList.js";
const loadListBtn = document.getElementById("load-list");
const searchbar = document.getElementById("searchbar");
const escapeFocusElem = document.getElementById("escape-focus");
const sortBtn = document.getElementById("sort-list");
const parentOfList = document.getElementById('list-items');
const loadingElem = document.getElementById('loader');
const fileInput = document.getElementById('file-import');
const contextMenu = document.getElementById('listMenuRC');
//Event listeners
//saveBtn.addEventListener('click', onButtonSave);
//loadListBtn.addEventListener('click', loadList);
searchbar.addEventListener('input', updateSearch);
document.getElementById("sort-list").onchange = sort_all;
document.getElementById("sort-order").onchange = sort_all;
document.getElementById("save-btn").onclick = saveAllChanges;
document.getElementById("add-item-btn").onclick = newItem;
document.getElementById("new-list-button").onclick = newList;
document.getElementById("sort-order").onclick = toggleAscendingSort;
document.getElementById("listRenameBtn").onclick = renameList;
document.getElementById("listSettingsBtn").onclick = settingsForList;
document.getElementById("listRemoveBtn").onclick = removeList;
document.getElementById("listShareBtn").onclick = shareList;
var sortOrder = 1;
var tagsDictionary = {}; // keeps track of how many times this tag was used
var hasNewItem = false;
var madeChange = false;
var warnedNoSave = false; // if you try to leave a list, warn once
var warnedRemove = false;
//*
//* START GLOBAL EVENTS:
//*
document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target)) { // hide the menu if its not a click in that menu
        contextMenu.classList.remove('show');
    }
});
document.onkeydown = function (event) {
    var source = event.target;
    if (event.key == "Enter" || event.key == "Escape") {
        if (source.className === 'editable') {
            getParentItem(source).focus();
        }
        else if (source.className != 'item-notes') {
            escapePress();
        }
        return;
    }
    var exclude = ['input', 'textarea'];
    if (exclude.indexOf(source.tagName.toLowerCase()) === -1) {
        if (isTypableKey(event.key)) { // start typing in the searchbar if its a letter
            focusSearch();
        }
        else if (event.key == "Backspace") { // if you want the backspace button to clear search
            focusSearch();
            updateSearch();
        }
    }
};
fileInput.addEventListener('change', handleFiles, false);
//*
//* END GLOBAL EVENTS
//*
/**
 * Handle file import
 * @param event
 */
function handleFiles(event) {
    const inputElement = event.target;
    if (inputElement.files && inputElement.files.length > 0) {
        document.getElementById("import-btn").style.backgroundColor = '#040';
        const selectedFile = inputElement.files[0]; // Access the first selected file
        document.getElementById("new-list-input").value = selectedFile.name.substring(0, selectedFile.name.length - 4);
        console.log(selectedFile.name + " was uploaded");
    }
}
;
function clearNewListInput() {
    console.log("removing stupid green coloring");
    fileInput.value = "";
    fileInput.files = null;
    document.getElementById("new-list-input").value = "";
    document.getElementById("import-btn").style.backgroundColor = "";
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
function displayListItem(itemData, visualID) {
    var original = document.getElementById('placeholder-item');
    if (original == null)
        return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.id = '';
    clone.classList.remove("placeholder");
    // set all of these clones child divs to use the listItem information
    clone.getElementsByClassName("item-id")[0].innerHTML = visualID.toString() || document.querySelectorAll('#list-items .item').length.toString(); // if an id is passed in use that (might be unnessecary if the selector is efficient)
    clone.getElementsByClassName("item-title")[0].innerHTML = itemData.title || "";
    clone.getElementsByClassName("item-tags")[0].innerHTML = (itemData.tags || "");
    addTags((itemData.tags || "").split(" "));
    clone.getElementsByClassName("item-rating")[0].innerHTML = (itemData.rating || "0").toString();
    clone.getElementsByClassName("item-notes")[0].innerHTML = itemData.notes || "";
    clone.getElementsByClassName("item-date")[0].innerHTML = (new Date(itemData.date).toDateString().replace(/^\S+\s/, '') || getNewDate()).toString();
    clone.dataset.dbid = itemData.itemID.toString();
    addItemEvents(clone);
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
    clone.dataset.value = "new"; //! SET THIS TAG SO THINGS READING IT CAN ACT ON IT
    clone.dataset.dbid = requestNewItem().itemID.toString();
    var newDate = (new Date()).toDateString().replace(/^\S+\s/, '');
    clone.getElementsByClassName("item-date")[0].innerHTML = newDate;
    saveChange({ itemID: Number(clone.dataset.dbid), date: newDate });
    addItemEvents(clone);
    parentOfList.insertBefore(clone, parentOfList.firstChild); // place this new element at the top.
    editTitle(clone);
    addSubmitButton(clone);
}
function toggleAscendingSort() {
    //@ts-ignore
    var toggleElem = this; // 'this' is defined by an onclick event call
    sortOrder = -sortOrder;
    if (sortOrder == 1) {
        toggleElem.innerHTML = "▲";
    }
    else {
        toggleElem.innerHTML = "▼";
    }
    sort_all();
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
        var newInput = this;
        var newTitle = toTitleCase(newInput.value);
        newInput.parentNode.innerHTML = newTitle;
        if (newInput.dataset.alt != newTitle) {
            madeEdit(anItem);
            saveChange({ itemID: Number(anItem.dataset.dbid), title: newTitle });
        }
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
function getParentItem(subElement) {
    if (!subElement || subElement.className == 'item')
        return subElement;
    return getParentItem(subElement.parentElement);
}
/**
 * Functions called after a new Item is added
 * @param anItem This is the item
 */
function addItemEvents(anItem) {
    anItem.getElementsByClassName("item-notes")[0].onchange = (event) => {
        madeEdit(anItem);
        var somein = event.target;
        saveChange({ itemID: Number(anItem.dataset.dbid), notes: somein.value });
    };
    anItem.getElementsByClassName("delete-item")[0].addEventListener("click", function (evt) {
        removeItem(anItem); // remove this element if you delete
    });
    var linkButtons = anItem.getElementsByClassName("change-item-image")[0];
    for (let i = 1; i < linkButtons.children.length; i++) {
        linkButtons.children[i].addEventListener("click", function (evt) {
            setImageUrl(anItem, i - 1); // << the event when you click an item image
        });
    }
    //clone.onclick = clickItem;
    makeEditable(anItem);
}
function isTypableKey(key) {
    if (key.length > 1)
        return false;
    return (key >= 'A' && key <= 'Z') || (key >= 'a' && key <= 'z') || key == '#' || (key >= '0' && key <= '9');
}
/**
 * Makes an Item editable, adding double click items
 * @param item
 */
function makeEditable(item) {
    var elementsList = ["title", "tags", "rating", "date"];
    elementsList.forEach(editedPortion => {
        item.getElementsByClassName(`item-${editedPortion}`)[0].ondblclick = function () {
            var thisElem = this;
            if (thisElem.childElementCount > 0)
                return;
            var val = thisElem.innerHTML;
            var input = document.createElement("input");
            input.value = val; // to be - new value
            input.dataset.alt = val; // old value
            input.className = 'editable';
            switch (editedPortion) {
                case "title":
                    input.onblur = function () {
                        var newInput = this;
                        var newTitle = toTitleCase(newInput.value);
                        newInput.parentNode.innerHTML = newTitle;
                        if (newInput.dataset.alt != newTitle) {
                            madeEdit(item);
                            saveChange({ itemID: Number(item.dataset.dbid), title: newTitle });
                        }
                    };
                    break;
                case "tags":
                    input.onblur = function () {
                        var newInput = this;
                        var newTags = newInput.value;
                        newInput.parentNode.innerHTML = newTags;
                        if (newInput.dataset.alt != newTags) {
                            madeEdit(item);
                            saveChange({ itemID: Number(item.dataset.dbid), tags: newTags });
                        }
                    };
                    break;
                case "rating":
                    input.style.width = "40px";
                    input.type = "number";
                    input.onblur = function () {
                        var newInput = this;
                        var newRating = Number(newInput.value);
                        newRating = newRating > 10 ? 10 : newRating;
                        newRating = newRating < 0 ? 0 : newRating;
                        newInput.parentNode.innerHTML = newRating.toString(); // = val | "0"; no idea why this works, but it truncates the 0s
                        if (Number(newInput.dataset.alt) != newRating) {
                            madeEdit(item);
                            saveChange({ itemID: Number(item.dataset.dbid), rating: newRating });
                        }
                    };
                    break;
                case "date":
                    input.onblur = function () {
                        var newInput = this;
                        var newDate = newInput.value;
                        newDate = isValidDate(newDate) ? new Date(newDate).toDateString().replace(/^\S+\s/, '') : getNewDate();
                        newInput.parentNode.innerHTML = newDate; // TODO: ternery current date
                        if (newInput.dataset.alt != newDate) {
                            madeEdit(item);
                            saveChange({ itemID: Number(item.dataset.dbid), date: newDate });
                        }
                    };
                    break;
            }
            thisElem.innerHTML = "";
            thisElem.appendChild(input);
            input.focus();
        };
    });
}
function getNewDate() {
    return new Date().toDateString().replace(/^\S+\s/, '');
}
/**
 * Using the Title from this element, request the api for a list of image URLs, which is stored and can be selected using the buttons
 * @param anItem Item in which to change the image
 * @param urlNum Out of the list of x images, which one do they want
 */
async function setImageUrl(anItem, urlNum) {
    var searchText = anItem.getElementsByClassName("item-title")[0].innerHTML;
    if (!searchText) {
        console.log("nothing to search for, in requestImageUrl");
        return;
    }
    var imageElem = anItem.querySelectorAll(".item-image div")[0]; // the actual image div
    var lastImageNumber = urlNum;
    if (imageElem.dataset.url) {
        if (imageElem.dataset.url == "-")
            return;
        var urlString = anItem.querySelectorAll(".item-image div")[0].dataset.url;
        var newUrl = urlString.split("\n")[lastImageNumber];
        updateImage(imageElem, newUrl);
        saveChange({ itemID: Number(anItem.dataset.dbid), imageURL: newUrl });
        madeEdit(anItem);
        return;
    }
    imageElem.dataset.url = "-"; // ensure no other requests are made for this element (its loading be patient)
    var allUrls = await requestImageUrls(searchText);
    if (!allUrls) {
        console.log("no urls :(");
        return;
    }
    ; // there was a problem fetching an image.. //TODO: notify an error?
    var urlStr = "";
    allUrls.map((u) => { urlStr += u + "\n"; });
    imageElem.dataset.url = urlStr;
    var url = allUrls[lastImageNumber];
    updateImage(imageElem, url); // this may not be the item you want unfortunatly, I dont know how to pass the item through when you request a url
    saveChange({ itemID: Number(anItem.dataset.dbid), imageURL: url });
    madeEdit(anItem);
}
/**
 * Remove an Item from the list
 * @param anItem
 */
function removeItem(anItem) {
    madeEdit(anItem);
    if (anItem.dataset.value == "new")
        hasNewItem = false;
    saveRemove(Number(anItem.dataset.dbid));
    anItem.remove();
    sort_all();
}
function findElementByDBID(dbid) {
    var theElement = parentOfList.querySelector(`.item[data-dbid=\"${dbid}\"]`);
    return theElement;
}
function newList() {
    if (madeChange) {
        if (!warnedNoSave) {
            warnedNoSave = true;
            displayNotification("warning", "Changes not saved! Press again to discard changes");
            return;
        }
        //if youve already warned them and they decide to discard changes, remove save button
        hideSaveButton();
    }
    warnedNoSave = false;
    var listText = document.getElementById("new-list-input").value;
    listText = toUsableFilename(listText);
    console.log("creating list " + listText);
    if (!listNameExists(listText) && listText.trim() != "") {
        if (fileInput.files && fileInput.files.length > 0) {
            const selectedFile = fileInput.files[0]; // Access the first selected file
            openNewList(listText, selectedFile);
        }
        else {
            openNewList(listText);
        }
        clearNewListInput();
        displayNotification("success", "Created list: '" + listText + "'");
    }
    else {
        displayNotification("error", "Failed to create list: '" + listText + "'");
    }
    escapePress();
}
// this function is no longer NEEDED but is useful for keeping the peace
function toUsableFilename(inputString) {
    return inputString.replace(/[/ \\?%*:|"<>]/g, '-');
}
function toListDisplayName(listname) {
    //TODO: make this better(or just remove it and put in an image)
    return listname.slice(0, 8);
}
/**
 * Creates the HTML elements for each list the user has access to
 * @param list listDef of list to display
 * @param isSelected whether this element is the one being used
 */
function createListHTML(list, isSelected) {
    var parentElement = document.getElementById("sidebar");
    var original = document.getElementById("sidebar-list");
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.id = "";
    clone.innerHTML = toListDisplayName(list.listname);
    clone.dataset.listname = list.listname;
    clone.dataset.owner = list.owner;
    parentElement.insertBefore(clone, parentElement.firstChild);
    //* you can add a right click here
    clone.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const contextMenu = document.getElementById('listMenuRC');
        contextMenu.dataset.listname = this.dataset.listname;
        contextMenu.dataset.owner = this.dataset.owner;
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add('show');
        contextMenu.classList.remove('hidden');
    });
    clone.addEventListener("click", function (evt) {
        //if the list is already selected dont change anything
        if (Array.from(this.classList).includes("selected"))
            return;
        if (madeChange) {
            if (!warnedNoSave) {
                warnedNoSave = true;
                displayNotification("warning", "Changes not saved! Press again to discard changes");
                return;
            }
            //if youve already warned them and they decide to discard changes, remove save button
            hideSaveButton();
        }
        warnedNoSave = false;
        removeAllItems();
        openList({ owner: this.dataset.owner, listname: this.dataset.listname });
        setSelectedList(this);
    });
    if (isSelected)
        setSelectedList(clone);
}
function setSelectedList(list) {
    hasNewItem = false;
    var parentElement = document.getElementById("sidebar");
    Array.from(parentElement.getElementsByClassName("sidebar-list")).forEach(list => {
        list.classList.remove("selected"); // remove selected class from all others
    });
    list.classList.add("selected"); // set this new list to selected
}
/**
 * Update all HTML values based on a change object
 * @param change
 */
function updateValuesFromChange(elem, change) {
    console.log("CHANGE: " + change.notes || "");
    if (change.title)
        elem.getElementsByClassName("item-title")[0].innerHTML = change.title;
    if (change.tags) {
        elem.getElementsByClassName("item-tags")[0].innerHTML = change.tags;
        addTags((change.tags || "").split(" "));
    }
    if (change.rating)
        elem.getElementsByClassName("item-rating")[0].innerHTML = change.rating.toString();
    if (change.notes)
        elem.getElementsByClassName("item-notes")[0].value = change.notes;
    if (change.date)
        elem.getElementsByClassName("item-date")[0].innerHTML = new Date(change.date).toDateString().replace(/^\S+\s/, '');
    if (change.imageURL)
        updateImage(elem.querySelectorAll(".item-image div")[0], change.imageURL);
}
/**
 * Called from removeList(), removes the HTML element from the UI
 * @param listname
 */
function removeListElem(listname, owner) {
    var parentElement = document.getElementById("sidebar");
    var currentLists = Array.from(parentElement.getElementsByClassName("sidebar-list"));
    currentLists.forEach(list => {
        const listElem = list;
        if (listElem.dataset.listname == listname && listElem.dataset.owner == owner) {
            list.remove();
        }
    });
}
//* START MENU RC buttons --------------
function renameList() {
    const listname = contextMenu.dataset.listname;
    const owner = contextMenu.dataset.owner;
    //TODO: implement
}
function settingsForList() {
    const listname = contextMenu.dataset.listname;
    const owner = contextMenu.dataset.owner;
    //TODO: implement
}
function removeList() {
    const listname = contextMenu.dataset.listname;
    const owner = contextMenu.dataset.owner;
    if (!listname || !owner)
        return;
    if (!warnedRemove) {
        warnedRemove = true;
        displayNotification("warning", `Remove '${listname}'? Press again to continue`);
        return;
    }
    warnedRemove = false;
    //!removeListElem(listname, owner);
    ClientList.removeList(owner, listname);
}
function shareList() {
    const listname = contextMenu.dataset.listname;
    const owner = contextMenu.dataset.owner;
    if (!listname || !owner)
        return;
    ClientList.shareList(owner, listname);
}
//* END MENU RC buttons --------------
//* Interact with the client backend (events and other)
/**
 * FROM, Displays list items as elements
 * @param listData
 */
export function displayList(listData) {
    removeAllItems();
    let itemCount = document.querySelectorAll('#list-items .item').length + 1;
    for (let i = 0; i < listData.length; i++) {
        displayListItem(listData[i], itemCount + i);
    }
    sort_all();
}
/**
 * FROM, Use the List in the UI
 */
export function displayAvailableLists(allLists, selectedList) {
    var parentElement = document.getElementById("sidebar");
    var currentLists = Array.from(parentElement.getElementsByClassName("sidebar-list"));
    currentLists.forEach(list => {
        if (list.id == "add-list")
            return;
        list.remove();
    });
    console.log(selectedList.listname + " is selected");
    allLists.forEach(list => {
        createListHTML(list, (selectedList.listname == list.listname && selectedList.owner == list.owner));
    });
}
/**
 * FROM, Use a change for the UI
 * @param changeData
 */
export function displayItemChange(changeData) {
    //find item to change (dataset.bdid)
    var theElement = findElementByDBID(changeData.itemID);
    if (!theElement) {
        // create an element if there isnt one with that id
        let itemCount = document.querySelectorAll('#list-items .item').length + 1;
        displayListItem(changeData, itemCount);
    }
    else {
        //update values
        updateValuesFromChange(theElement, changeData);
    }
    //sort?
    sort_all();
}
/**
 * Removes an element by its id
 * @param id
 */
export function removeByID(id) {
    var theElement = findElementByDBID(id);
    console.log("removing item: " + theElement);
    theElement.remove();
    console.log("removed the: " + theElement);
    sort_all();
}
/**
 * Loading animation
 */
export function startLoading() {
    loadingElem.classList.remove("hidden");
}
export function endLoading() {
    loadingElem.classList.add("hidden");
}
function listNameExists(listName) {
    return ClientList.listNameExists(listName);
}
/**
 * TO, Update a change for the server to use if you save
 * @param changeData
 */
function saveChange(changeData) {
    ClientList.addChange(changeData);
}
function saveRemove(id) {
    ClientList.addChange({ itemID: id });
}
/**
 * TO, When you want to create a new item for this list
 * @returns new item
 */
function requestNewItem() {
    return ClientList.requestNewListItem();
}
async function requestImageUrls(imgQuery) {
    return await ClientList.requestImageUrls(imgQuery);
}
/**
 * TO, Open a list
 * @param listDef
 */
function openList(listDef) {
    ClientList.requestOpenList(listDef.owner, listDef.listname);
}
/**
 * TO, Create and start editing a new list by this name (if you dont save any changes the list wont be created/saved on the server)
 * @param listname name of the new list to create
 */
function openNewList(listname, importFile) {
    ClientList.createNewList(listname, importFile);
}
/**
 * TO, Save all Changes gathered so far
 */
function saveAllChanges() {
    madeChange = false;
    ClientList.pushAllChanges();
}

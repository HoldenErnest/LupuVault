// Holden Ernest - 1/11/2024
// This handles all of the actual application proccesses

const saveBtn = document.getElementById("save");
const loadListBtn = document.getElementById("load-list");
const searchbar = document.getElementById("searchbar");
const escapeFocusElem = document.getElementById("escape-focus");
const sortBtn = document.getElementById("sort-list");

//Event listeners
//saveBtn.addEventListener('click', onButtonSave);
//loadListBtn.addEventListener('click', loadList);
searchbar.addEventListener('input', updateSearch);
document.getElementById("sort-list").onchange = sort_all;
document.getElementById("sort-order").onchange = sort_all;
document.getElementById("save-btn").onclick = saveList;
document.getElementById("add-item-btn").onclick = newItem;
document.getElementById("new-list-button").onclick = newList;
document.getElementById("sort-order").onclick = toggleAscendingSort;

var warnedNoSave = false; // if you havent saved and you try to leave, warn the user ONCE, when they next try again, let them 
var madeChange = false; // determine when the save button needs to appear
var hasNew = false; // whether the list has a new element that hasnt been submitted
var lastImageEdit; // determine what item to put the image in when its done async loading
var lastImageNumber = 0; // what image was the last selected for some reason
var allListsArray = []; // list of names that are all your available lists

var tagsDictionary = {}; // a dictonary of all tags the user has

var sortOrder = 1;

document.addEventListener('click', (event) => { // EVENT FOR ALL CLICKING
    const contextMenu = document.getElementById('listMenuRC');
    if (!contextMenu.contains(event.target)) { // hide the menu if its not a click in that menu
      contextMenu.classList.remove('show');
    }
});

function setupListListeners() { // when you double click a list
    var allListElements = Array.from(document.getElementsByClassName('sidebar-list'));
    allListElements.forEach((listE) => {
        listE.ondblclick = function(){
            console.log("double clicked");
            if (this.childElementCount > 0) return;
            var val=this.innerHTML;
            var input=document.createElement("input");
            input.value=val;
            input.alt=val;
            input.className = 'editable list-rename';

            input.onblur=function(){
                var listName = toUsableFilename(this.value);
                if (this.alt != this.value) { // if its changed
                    window.api.send("rename-list", listName);
                }
                this.parentNode.innerHTML = listName;
                this.remove();
            }
            this.innerHTML="";
            this.appendChild(input);
            input.focus();
        }
    });
}

function sort_all() {
    var toSort = document.getElementById('list-items').children;
    toSort = Array.prototype.slice.call(toSort, 0);
    toSort.sort(function(a, b) {
        let nameA = a.getElementsByClassName(`item-${sortBtn.value}`)[0].innerHTML.toLowerCase();
        let nameB = b.getElementsByClassName(`item-${sortBtn.value}`)[0].innerHTML.toLowerCase();
        if (sortBtn.value == "rating") {
            nameA = parseInt(nameA);
            nameB = parseInt(nameB);
        } else if (sortBtn.value == "date") {
            nameA = Date.parse(nameA) || 0;
            nameB = Date.parse(nameB) || 0;
        }
        if (nameA < nameB) return -sortOrder;
        if (nameA > nameB) return sortOrder;
        return 0;
    });
    var parent = document.getElementById('list-items');
    parent.innerHTML = "";

    for(var i = 0, l = toSort.length; i < l; i++) {
        parent.appendChild(toSort[i]);
        toSort[i].getElementsByClassName("item-id")[0].innerHTML = i+1;
    }
}
function toTitleCase(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
}
function makeEditable(item) {

    var elementsList = ["title","tags","rating","date"];

    elementsList.forEach(element => {
        item.getElementsByClassName(`item-${element}`)[0].ondblclick=function(){
            if (this.childElementCount > 0) return;
            var val=this.innerHTML;
            var input=document.createElement("input");
            input.value=val;
            input.alt = val;
            input.className = 'editable';
            switch (element) {
                case "title":
                    input.onblur=function(){
                        var val=this.value;
                        this.parentNode.innerHTML=toTitleCase(val);
                        if (this.alt != val)
                            madeEdit(item);
                    }
                    break;
                case "tags":
                    input.onblur = function() {
                        var val = this.value;
                        this.parentNode.innerHTML = val;
                        if (this.alt != val)
                            madeEdit(item);
                    }
                    break;
                case "rating":
                    input.style.width = "40px";
                    input.type = "number";
                    input.onblur = function() {
                        var val = this.value;
                        val = val > 10 ? 10 : val;
                        val = val < 0  ? 0 : val;
                        this.parentNode.innerHTML = val | "0"; // no idea why this works, but it truncates the 0s
                        if (this.alt != val)
                            madeEdit(item);
                    }
                    break;
                case "date":
                    input.onblur = function() {
                        var val = this.value;
                        val = isValidDate(val) ? new Date(val).toDateString().replace(/^\S+\s/,'') : new Date().toDateString().replace(/^\S+\s/,'')
                        this.parentNode.innerHTML = val; // TODO: ternery current date
                        if (this.alt != val)
                            madeEdit(item);
                    }
                    break;
            }
            this.innerHTML="";
            this.appendChild(input);
            input.focus();
        }
    });
}
function madeEdit(anItem) { // anytime an item is changed, call this method to see if it will update save
    if (madeChange) return;
    if (anItem.value == "new") return;
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
    displayNotification("warning","Changes discarded");
}
function saveList() {
    madeChange = false;
    // dont have to use hideSaveButton() since its toggled off when you click it
    var allItems = document.querySelectorAll('#list-items .item');
    var csvString = "";
    for (let i = 0; i < allItems.length; i++) { // Optimization? what?
        csvString += "\"";
        // TODO: make sure these are all csv safe
        csvString += allItems[i].getElementsByClassName("item-title")[0].innerHTML.replaceAll("\"","'");
        csvString += "\",\"";
        csvString += allItems[i].getElementsByClassName("item-notes")[0].value.replaceAll("\"","'").replaceAll("\n","\\n");
        csvString += "\",\"";
        csvString += allItems[i].getElementsByClassName("item-rating")[0].innerHTML || "-";
        csvString += "\",\"";
        csvString += allItems[i].getElementsByClassName("item-tags")[0].innerHTML.replaceAll(", "," ");
        csvString += "\",\"";
        csvString += allItems[i].getElementsByClassName("item-date")[0].innerHTML;
        csvString += "\",\"";
        var img = allItems[i].querySelectorAll(".item-image div")[0];
        var style = img.currentStyle || window.getComputedStyle(img, false);
        if (style) {
            var imgUrl = style.backgroundImage.slice(65, -1).replace(/"/g, "");
            if (!imgUrl.startsWith("file://")) // if you dont have any unique url, dont save it
                csvString += imgUrl;
        }
        csvString += "\"\n";
    }
    window.api.send("save-list", csvString);
}
function getParentItem(subElement) { // get the item if its a parent of the subElement
    if (!subElement || subElement.className == 'item') return subElement;
    return getParentItem(subElement.parentElement);
}
document.onkeydown = function(event) {
    var source = event.target;
    if (event.key == "Enter" || event.key == "Escape") {
        if (source.className === 'editable') {
            getParentItem(source).focus();
        } else if (source.className != 'item-notes'){
            escapePress();
        }
        return;
    }
    exclude = ['input', 'textarea'];
    if (exclude.indexOf(source.tagName.toLowerCase()) === -1) {
        if (isTypableKey(event.key)) { // start typing in the searchbar if its a letter
            focusSearch();
        } else if (event.key == "Backspace") { // if you want the backspace button to clear search
            focusSearch();
            updateSearch();
        }
    }
};
function isTypableKey(key) {
    if (key.length > 1) return false;
    return (key >= 'A' && key <= 'Z') || (key >= 'a' && key <= 'z') || key == '#' || (key >= '0' && key <= '9');
}
function escapePress() {
    escapeFocusElem.focus();
}
function loadList(listname) {
    window.api.send("load-list", listname);
    // have main load the list, which will eventually be brought back through "display-list"
    // this is essentially "IPCrenderer.send"
}
function updateSearch() {
    var searched = searchbar.value;
    if (searched == "") {
        showAllItems();
        return;
    }

    // find any tag or rating searches within this string
    const ratingEx = /\d{1,2}\/10/;
    var searchRating = ratingEx.exec(searched);
    const tagsEx = /#\w+/g;
    var searchTags = searched.match(tagsEx); // to get an array of multiple, you need to use match

    // remove the other searched terms from the title search
    if (searchRating) {
        searched = searched.replace(ratingEx, "");
        // remove the '/10'
        searchRating = (searchRating[0]).substring(0, searchRating[0].length - 3);
    }
    if (searchTags) searched = searched.replace(tagsEx, "");
    searched = searched.replaceAll(/\s+/g, ' '); // remove all extraneous spaces from the title / clean it up
    searched = searched.replaceAll("#", '')
    searched = searched.trim();
    if (searched == "") searched = null;

    // loop through all DOM items (except the placeholder one)
    var items = Array.from(document.getElementsByClassName("item"));
    if (!items || items.length <= 1) { console.error("there are no items?"); return; }
    for(let i = 1; i < items.length; i++) {
        // Item components
        let theItemTitle = items[i].getElementsByClassName("item-title")[0].innerHTML.toLowerCase();
        let theItemRating = items[i].getElementsByClassName("item-rating")[0].innerHTML.toLowerCase();
        let theItemTags = items[i].getElementsByClassName("item-tags")[0].innerHTML.toLowerCase();

        // test if the item has your search
        let hasSearchedTitle = (!searched || theItemTitle.includes(searched.toLowerCase()));
        let hasSearchedRating = (!searchRating || theItemRating == searchRating);
        let hasSearchedTags = () => {
            if (!searchTags) return true;
            for (let i = 0; i < searchTags.length; i++){ // if any of the searched tags arent in the item, hide it
                searchTags[i] = searchTags[i].replace("#","");
                if (!theItemTags.toLowerCase().includes(searchTags[i].toLowerCase())) return false;
            }
            return true;
        }
        if ( hasSearchedTitle && hasSearchedRating && hasSearchedTags()) {
            items[i].style.display = 'block';
        } else {
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
    for(let i = 1; i < items.length; i++) {
        items[i].style.display = 'block';
    }
}
function removeAllItems() {
    let allItems = document.querySelectorAll('#list-items .item');
    Array.from(allItems).forEach((item) => {
        item.remove();
    });
}
function removeItem(anItem) {
    madeEdit(anItem);
    if (anItem.value == "new") hasNew = false;
    anItem.remove();
    sort_all();
}
function requestImageUrl(anItem, urlNum) {
    var searchText = anItem.getElementsByClassName("item-title")[0].innerHTML;
    if (!searchText) {console.log("nothing to search for, in requestImageUrl");return;}
    lastImageEdit = anItem.querySelectorAll(".item-image div")[0];
    lastImageNumber = urlNum;
    if (anItem.querySelectorAll(".item-image div")[0].value) {
        urlString = anItem.querySelectorAll(".item-image div")[0].value;
        updateImage(lastImageEdit, urlString.split("\n")[lastImageNumber])
        return;
    }
    window.api.send("get-urls", searchText);
}
function updateImage(theItemImage, url) {
    theItemImage.style.background = `linear-gradient(to left, transparent, #222), url("${url}")`;
    theItemImage.style.backgroundRepeat = "no-repeat";
    theItemImage.style.backgroundSize = "cover";
    theItemImage.style.backgroundPosition = "center";
}
window.api.receive('update-image', (urls) => {
    var urlString = "";
    urls.map((u) => {urlString += u + "\n"});
    lastImageEdit.value = urlString;
    url = urls[lastImageNumber];
    updateImage(lastImageEdit, url); // this may not be the item you want unfortunatly, I dont know how to pass the item through when you request a url
    madeEdit(getParentItem(lastImageEdit));
});

window.api.receive('display-list', (listData) => {
    // when Main wants a list displayed (this is essentially "IPCrenderer.on")
    removeAllItems();
    displayListItems(listData);
});
function displayListItems(listData) {
    let itemCount = document.querySelectorAll('#list-items .item').length + 1;
    for(let i = 0; i < listData.length; i++) {
        displayListItem(listData[i], itemCount+i);
    }
    sort_all();
}
function displayListItem(itemData, itemID) {
    var original = document.getElementById('placeholder-item');
    if (original == null) return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.id = '';
    clone.classList.remove("placeholder");
    // set all of these clones child divs to use the listItem information
    clone.getElementsByClassName("item-id")[0].innerHTML = itemID || document.querySelectorAll('#list-items .item').length; // if an id is passed in use that (might be unnessecary if the selector is efficient)
    clone.getElementsByClassName("item-title")[0].innerHTML = itemData.title;
    clone.getElementsByClassName("item-tags")[0].innerHTML = itemData.tags;
    addTags(itemData.tags);
    clone.getElementsByClassName("item-rating")[0].innerHTML = itemData.rating;
    clone.getElementsByClassName("item-notes")[0].innerHTML = itemData.notes;
    clone.getElementsByClassName("item-date")[0].innerHTML = isValidDate(itemData.date) ? (new Date(itemData.date)).toDateString().replace(/^\S+\s/,'') : "invalid date";
    addItemEvents(clone);
    if (itemData.image) { // if it has a unique image url, make sure to update it
        updateImage(clone.querySelectorAll(".item-image div")[0], itemData.image)
    }
    var parent = document.getElementById('list-items');
    parent.appendChild(clone);
}
function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
}
function addTags(tagsString) { // given a string of tags, parse them into the tags dictionary
    (tagsString.split(", ")).forEach((tag) => {
        if (tag)
            tagsDictionary[tag] = tagsDictionary[tag]+1 || 1;
    });
    /* // Display the keys
    console.log("\n\n::");
    Object.keys(tagsDictionary).forEach( (key) => {
        console.log(key + ":" + tagsDictionary[key] + "\n");
    });*/
    
    
}
function newItem() {
    if (hasNew) {console.log("there is already an unsubmitted new Item");return}; // dont make a second new item
    hasNew = true;
    var original = document.getElementById('placeholder-item');
    if (original == null) return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.id = '';
    clone.value = "new"; // SET THIS TAG SO THINGS READING IT CAN ACT ON IT
    clone.getElementsByClassName("item-date")[0].innerHTML = (new Date()).toDateString().replace(/^\S+\s/,'')
    addItemEvents(clone);
    parentOfList = document.getElementById('list-items');
    parentOfList.insertBefore(clone, parentOfList.firstChild); // place this new element at the top.
    editTitle(clone);
    addSubmitButton(clone);
}
function editTitle(anItem) { // when you make a new item, edit the title immediatly
    var theTitle = anItem.getElementsByClassName("item-title")[0];

    var val=theTitle.innerHTML;
    var input = document.createElement("input");
    input.value=val;
    input.className = 'editable';
    input.onblur=function(){
        var val=this.value;
        theTitle.innerHTML=toTitleCase(val);
        /*
        madeEdit(anItem);
        sort_all();
        escapePress();
        */
    }
    theTitle.innerHTML="";
    theTitle.appendChild(input);
    input.focus();
}
function addSubmitButton(anItem) { // when you make a new item, have the id slot be for a submit
    var theId = anItem.getElementsByClassName("item-id")[0];
    theId.style.backgroundColor = "#171";
    theId.onclick = function(){
        escapePress();
        anItem.value = null; // UNSET THE "new" TAG
        // remove all events from the id
        this.onclick = null;
        this.onmouseenter = null;
        this.onmouseleave = null;
        this.style.backgroundColor = "transparent";

        sort_all();
        madeEdit(anItem);
        hasNew = false; // when youve saved this new item, make sure to allow other items to be created
    }
    theId.onmouseenter = function() {
        theId.style.backgroundColor = "#151";
    };
    theId.onmouseleave = function() {
        theId.style.backgroundColor = "#171";
    }
}
function addItemEvents(anItem) {
    anItem.getElementsByClassName("item-notes")[0].onchange = () => {madeEdit(anItem);}
    anItem.getElementsByClassName("delete-item")[0].addEventListener("click", function(evt) {
        removeItem(anItem); // remove this element if you delete
    });
    var linkButtons = anItem.getElementsByClassName("change-item-image")[0];
    for (let i = 1; i < linkButtons.children.length; i++) {
        linkButtons.children[i].addEventListener("click", function(evt) {
            requestImageUrl(anItem, i-1); // << the event when you click an item image
        });
    }
    //clone.onclick = clickItem;
    makeEditable(anItem);
}
/* // alternate click item method for if I need more functionality
function clickItem() {
    this.focus();
    console.log("You've cliked to : " + this);
}*/
function newList() { // crete a new list based off #new-list-input
    var listText = document.getElementById("new-list-input").value;
    listText = toUsableFilename(listText);
    console.log("creating list " + listText);
    // TODO: send to main to display this listText
    // then add this to the list of available list names(if its not already a list)
    if (!listNameExists(listText)) {
        allListsArray.push(listText);
        createList(listText);
    }
    escapePress();
}
function toUsableFilename(inputString) {
    return inputString.replace(/[/ \\?%*:|"<>]./g, '-');
}
function listNameExists(listName) {
    for (var i = 0; i < allListsArray.length; i++) {
        if (allListsArray[i] == listName) return true;
    }
    return false;
}
window.api.receive('recieve-list-names', (listsData) => {
    console.log("recieved lists " + listsData.allNames);
    allListsArray = listsData.allNames;
    //update all available lists sidebar
    updateAllAvailableLists(listsData.selectedList);
});
function updateAllAvailableLists(selectedList) {
    var parentElement = document.getElementById("sidebar");
    var currentLists = Array.from(parentElement.getElementsByClassName("sidebar-list"));
    currentLists.forEach(list => { // remove all prev lists
        if (list.id == "add-list") return;
        list.remove();
    });
    console.log(selectedList + " is selected");
    allListsArray.forEach(list => {
        createList(list, selectedList == list);
    });
    setupListListeners();
}
function createList(listName, isSelected) { // A new list display on the sidebar
    var parentElement = document.getElementById("sidebar");
    var original = document.getElementById("sidebar-list");
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.id = "";
    clone.innerHTML = listName;
    clone.value = listName; // TODO make this more visible
    parentElement.insertBefore(clone, parentElement.firstChild);
    clone.addEventListener('contextmenu', function(event) { // RIGHT CLICK MENU
        event.preventDefault();
        
        const contextMenu = document.getElementById('listMenuRC');
        contextMenu.value = this.value;
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add('show');
    });

    clone.addEventListener("click", function(evt) {
        //if the list is already selected dont change anything
        if (Array.from(this.classList).includes("selected")) return;

        if (madeChange) {
            if (!warnedNoSave) {
                warnedNoSave = true;
                displayNotification("warning","Changes not saved! Press again to discard changes")
                return;
            }
            //if youve already warned them and they decide to discard changes, remove save button
            hideSaveButton();
        }
        warnedNoSave = false;

        removeAllItems(); // You can remove this to make it so that any newly created list derrives from the currently selected list.
        loadList(this.value);
        setSelected(this);
    });
    if (isSelected) setSelected(clone);
}

function setSelected(list) { // sets the selected list (not list Item)
    hasNew = false;
    var parentElement = document.getElementById("sidebar");
    Array.from(parentElement.getElementsByClassName("sidebar-list")).forEach(list => {
        list.classList.remove("selected"); // remove selected class from all others
    });
    list.classList.add("selected"); // set this new list to selected
}
function toggleAscendingSort() {
    toggleElem = this;
    sortOrder = -sortOrder;
    console.log(sortOrder + ", " + toggleElem);
    if (sortOrder == 1) {
        toggleElem.innerHTML = "▲";
    } else {
        toggleElem.innerHTML = "▼";
    }

    sort_all();
}
//NOTIFICAITON STUFF
window.api.receive('send-notification', (notiObj) => {
    displayNotification(notiObj.type,notiObj.message);
});
function displayNotification(type, message) { // display a notification of a certain type.
    // type can be either 'success' 'warning' 'error'
    //animation handled with css
    console.log("notification["+ type + "]: " + message)
    const newNoti = newNotificationItem(type,message);
    fadeOutAfter(newNoti,5); // set fade effect
}
function newNotificationItem(type, message) { // create a new HTML element for a notification
    var original = document.getElementById('placeholder-noti');
    if (original == null) return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.classList.add(type);
    clone.id = '';
    clone.innerHTML = message;
    notiDiv = document.getElementById('notification-area');
    notiDiv.appendChild(clone);
    return clone;
}

function fadeOutAfter(element, seconds) {
    const fadeEffectTime = 2;
    setTimeout(() => {
      element.style.opacity = 1; // Ensure initial opacity
      element.style.transition = `opacity ${fadeEffectTime}s ease-in`;
      element.style.opacity = 0;
      setTimeout(() => { // the actual transition will take fadeEffectTime to complete, wait for then
        element.remove();
      }, fadeEffectTime * 1000);
    }, seconds * 1000);
}

// RIGHT CLICK MENU-------
document.getElementById('listRenameBtn').addEventListener('click', function() {
    const contextMenu = this.parentElement;
    console.log(contextMenu.value + " is the list getting renamed");
    //TODO: implement
});
document.getElementById('listRemoveBtn').addEventListener('click', function() {
    const contextMenu = this.parentElement;
    console.log(contextMenu.value + " is the list getting removed");
    //TODO: implement
});
document.getElementById('listSettingsBtn').addEventListener('click', function() {
    const contextMenu = this.parentElement;
    window.api.send("open-settings", {listName:contextMenu.value});
});

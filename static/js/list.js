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
//document.getElementById("sort-list")!.onchange = sort_all;
//document.getElementById("sort-order")!.onchange = sort_all;
//document.getElementById("save-btn")!.onclick = saveList;
//document.getElementById("add-item-btn")!.onclick = newItem;
//document.getElementById("new-list-button")!.onclick = newList;
//document.getElementById("sort-order")!.onclick = toggleAscendingSort;
var sortOrder = 1;
var tagsDictionary = {}; // keeps track of how many times this tag was used
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
    addTags(itemData.tags);
    clone.getElementsByClassName("item-rating")[0].innerHTML = itemData.rating.toString();
    clone.getElementsByClassName("item-notes")[0].innerHTML = itemData.notes;
    clone.getElementsByClassName("item-date")[0].innerHTML = itemData.date.toString();
    if (itemData.imageURL) { // if it has a unique image url, make sure to update it
        updateImage(clone.querySelectorAll(".item-image div")[0], itemData.imageURL);
    }
    var parent = document.getElementById('list-items');
    parent.appendChild(clone);
}
export function displayList(listData) {
    removeAllItems();
    displayListItems(listData);
}

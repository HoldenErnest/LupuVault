"use strict";
// Holden Ernest - 5/14/2025
// Generic methods for an overall site vibe
Array.from(document.getElementsByClassName('copyable')).forEach(element => {
    element.addEventListener("click", copyText);
});
function copyText(event) {
    const target = event.currentTarget;
    const textToCopy = target.textContent; // Or .textContent, or a data attribute
    navigator.clipboard.writeText(textToCopy);
    target.style.backgroundColor = "#111";
    target.style.color = "#333";
    target.style.cursor = "default";
}
function displayNotification(type, message) {
    // type can be either 'success' 'warning' 'error'
    //animation handled with css
    console.log("notification[" + type + "]: " + message);
    const newNoti = newNotificationItem(type, message);
    if (!newNoti) {
        console.error("notification object not found");
        return;
    }
    fadeOutAfter(newNoti, 5); // set fade effect
}
function newNotificationItem(type, message) {
    var original = document.getElementById('placeholder-noti');
    if (original == null)
        return;
    var clone = original.cloneNode(true); // "deep" clone
    clone.classList.remove("placeholder");
    clone.classList.add(type);
    clone.id = '';
    clone.innerHTML = message;
    var notiDiv = document.getElementById('notification-area');
    notiDiv.appendChild(clone);
    return clone;
}
function fadeOutAfter(element, seconds) {
    const fadeEffectTime = 2;
    setTimeout(() => {
        element.style.opacity = "1"; // Ensure initial opacity
        element.style.transition = `opacity ${fadeEffectTime}s ease-in`;
        element.style.opacity = "0";
        setTimeout(() => {
            element.remove();
        }, fadeEffectTime * 1000);
    }, seconds * 1000);
}

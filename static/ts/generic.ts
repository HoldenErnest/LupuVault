// Holden Ernest - 5/14/2025
// Generic methods for an overall site vibe

Array.from(document.getElementsByClassName('copyable')).forEach(element => {
    (element as HTMLElement).addEventListener("click", copyText);
});

function copyText(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const textToCopy = target.textContent; // Or .textContent, or a data attribute
    navigator.clipboard.writeText(textToCopy!)
    
    target.style.backgroundColor = "#111";
    target.style.color = "#333";
    target.style.cursor = "default";
}

function displayNotification(type:string, message:string) { // display a notification of a certain type.
    // type can be either 'success' 'warning' 'error'
    //animation handled with css
    console.log("notification["+ type + "]: " + message)
    const newNoti = newNotificationItem(type,message);
    if (!newNoti) {
        console.error("notification object not found");
        return;
    }
    fadeOutAfter(newNoti,5); // set fade effect
}
function newNotificationItem(type:string, message:string): HTMLElement | undefined { // create a new HTML element for a notification
    var original = document.getElementById('placeholder-noti');
    if (original == null) return;
    var clone = original.cloneNode(true) as HTMLElement; // "deep" clone
    clone.classList.remove("placeholder");
    clone.classList.add(type);
    clone.id = '';
    clone.innerHTML = message;
    var notiDiv = document.getElementById('notification-area') as HTMLElement;
    notiDiv.appendChild(clone);
    return clone;
}

function fadeOutAfter(element: HTMLElement, seconds:number) {
    const fadeEffectTime = 2;
    setTimeout(() => {
      element.style.opacity = "1"; // Ensure initial opacity
      element.style.transition = `opacity ${fadeEffectTime}s ease-in`;
      element.style.opacity = "0";
      setTimeout(() => { // the actual transition will take fadeEffectTime to complete, wait for then
        element.remove();
      }, fadeEffectTime * 1000);
    }, seconds * 1000);
}
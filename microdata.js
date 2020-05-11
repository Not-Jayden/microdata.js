function parseMicrodata() {
    let items = document.querySelectorAll('[itemscope]:not([itemprop])');
    let array;
    if (items.length > 1) {
        array = [];
        for (let i = 0; i < items.length; i++) {
            array.push(flattenItemObject(items[i]));
        }
    }
    else if (items.length === 1) {
        array = flattenItemObject(items[0])
    }
    return array;
}


function getItemObject(item, includeContext = true) {
    let itemObject = {};
    let itemtypeURL = new URL(item.getAttribute('itemtype'), document.baseURI);
    if (includeContext) {
        itemObject["@context"] = itemtypeURL.origin;
    }
    itemObject["@type"] = itemtypeURL.pathname.substring(1);
    if (item.getAttribute('itemid')) {
        itemObject["@id"] = new URL (item.getAttribute('itemid'), document.baseURI).href || item.getAttribute('itemid');
    }
    return itemObject;
}

function getItemProperties(item) {
    let itemPropertiesObj = {};
    let itemPropertyNodeList = item.querySelectorAll('[itemprop]');
    for (let i = 0; i < itemPropertyNodeList.length; i++) {
        if (itemPropertyNodeList[i].parentNode.closest('[itemscope]') == item) {
            let itemPropertyKey = itemPropertyNodeList[i].getAttribute('itemprop');
            let itemPropertyValue = getItemPropertyValue(itemPropertyNodeList[i]); // use proper function for getting the correct value attribute for the elem type
            // inster the getItemValue function here
            if (itemPropertiesObj.hasOwnProperty(itemPropertyKey) && itemPropertyNodeList[i].hasAttribute('itemscope')) {
                if (Array.isArray(itemPropertiesObj[itemPropertyKey])) {
                    let itemPropertiesArray = itemPropertiesObj[itemPropertyKey];
                    itemPropertiesArray.push(itemPropertyValue);
                    itemPropertiesObj[itemPropertyKey] = itemPropertiesArray;
                }
                else {
                    let itemPropertiesArray = [];
                    itemPropertiesArray.push(itemPropertiesObj[itemPropertyKey], itemPropertyValue);
                    itemPropertiesObj[itemPropertyKey] = itemPropertiesArray;
                }
            }
            else if (!itemPropertiesObj.hasOwnProperty(itemPropertyKey)) {
                itemPropertiesObj[itemPropertyKey] = itemPropertyValue;
            }
        }
    }
    return itemPropertiesObj;
}

function flattenItemObject(item, includeContext) {
    let itemObject = getItemObject(item, includeContext);
    let itemProperties = getItemProperties(item);
    Object.assign(itemObject, itemProperties);
    return itemObject;
}

function getItemPropertyValue(item) {
    let itemPropertyValue = "";
    let elementType = item.nodeName;

    let sourceElementTypes = ["AUDIO", "EMBED", "IFRAME", "IMG", "SOURCE", "TRACK", "VIDEO"];
    let hrefElementTypes = ["A", "AREA", "LINK"];
    let objectElementTypes = ["OBJECT"];
    let valueElementTypes = ["DATA", "METER"];
    let datetimeElementTypes = ["TIME"];

    if (item.hasAttribute('itemscope')) {
        itemPropertyValue = flattenItemObject(item, false);
    }
    else if (item.getAttribute("content")) {
        itemPropertyValue = cleanText(item.getAttribute("content"));
    }
    else if (sourceElementTypes.includes(elementType)) {
        itemPropertyValue = cleanText(item.getAttribute("src"));
        url = new URL(itemPropertyValue, document.baseURI).href;
        itemPropertyValue = url || cleanText(item.getAttribute("href"));
    }
    else if (hrefElementTypes.includes(elementType)) {
        itemPropertyValue = cleanText(item.getAttribute("href"));
        url = new URL(itemPropertyValue, document.baseURI).href;
        itemPropertyValue = url || cleanText(item.getAttribute("href"));
    }
    else if (objectElementTypes.includes(elementType)) {
        itemPropertyValue = cleanText(item.getAttribute("data"));
    }
    else if (valueElementTypes.includes(elementType)) {
        itemPropertyValue = cleanText(item.getAttribute("value"));
    }
    else if (datetimeElementTypes.includes(elementType)) {
        itemPropertyValue = cleanText(item.getAttribute("datetime"));
    }
    else {
        itemPropertyValue = cleanText(item.textContent) || "";
    }
    return itemPropertyValue;
}

function cleanText(textValue) {
    function htmlDecode(text) {
        let textElem = document.createElement("textarea");
        textElem.innerHTML = text;
        let textContent = textElem.innerText;
        return textContent;
    }
    let textContent = htmlDecode(textValue);
    textContent = htmlDecode(textContent); //this is repeated for a very specific use case of a website having their text html encoded twice
    textContent = textContent.trim();
    return textContent;
}
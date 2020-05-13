(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseMicrodata = void 0;
    function parseMicrodata(document = window.document) {
        var _a;
        let items = document.querySelectorAll('[itemscope]');
        let array = [];
        for (let i = 0; i < items.length; i++) {
            let hasParentElement = (_a = items[i].parentElement) === null || _a === void 0 ? void 0 : _a.closest('[itemscope]');
            let hasItemProp = items[i].hasAttribute('itemprop');
            if (!hasParentElement) {
                array.push(flattenItemObject(items[i]));
            }
            else if (!hasItemProp) {
                array.push(flattenItemObject(items[i]));
            }
        }
        if (array.length === 1) {
            return array[0];
        }
        else {
            return array;
        }
    }
    exports.parseMicrodata = parseMicrodata;
    function getItemObject(item, includeContext = true) {
        let itemObject = {};
        let itemtypeURL = new URL(item.getAttribute('itemtype'), document.baseURI);
        if (includeContext) {
            itemObject["@context"] = itemtypeURL.origin;
        }
        itemObject["@type"] = itemtypeURL.pathname.substring(1);
        if (item.getAttribute('itemid')) {
            itemObject["@id"] = new URL(item.getAttribute('itemid'), document.baseURI).href || item.getAttribute('itemid');
        }
        return itemObject;
    }
    function getItemProperties(item) {
        var _a;
        let itemPropertiesObj = {};
        let itemPropertyNodeList = item.querySelectorAll('[itemprop]');
        for (let i = 0; i < itemPropertyNodeList.length; i++) {
            if (((_a = itemPropertyNodeList[i].parentElement) === null || _a === void 0 ? void 0 : _a.closest('[itemscope]')) == item) {
                let itemPropertyKey = itemPropertyNodeList[i].getAttribute('itemprop');
                let itemPropertyValue = getItemPropertyValue(itemPropertyNodeList[i]);
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
    function flattenItemObject(item, includeContext = true) {
        let itemObject = getItemObject(item, includeContext);
        let itemProperties = getItemProperties(item);
        Object.assign(itemObject, itemProperties);
        return itemObject;
    }
    function getItemPropertyValue(item) {
        let itemPropertyValue;
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
            itemPropertyValue = item.getAttribute("content");
        }
        else if (sourceElementTypes.includes(elementType)) {
            let url = new URL(item.getAttribute("src"), document.baseURI).href;
            itemPropertyValue = url || item.getAttribute("href");
        }
        else if (hrefElementTypes.includes(elementType)) {
            let url = new URL(item.getAttribute("href"), document.baseURI).href;
            itemPropertyValue = url || item.getAttribute("href");
        }
        else if (objectElementTypes.includes(elementType)) {
            itemPropertyValue = item.getAttribute("data");
        }
        else if (valueElementTypes.includes(elementType)) {
            itemPropertyValue = item.getAttribute("value");
        }
        else if (datetimeElementTypes.includes(elementType)) {
            itemPropertyValue = item.getAttribute("datetime");
        }
        else {
            itemPropertyValue = item.textContent || "";
        }
        return itemPropertyValue;
    }
});
//# sourceMappingURL=microdata.js.map
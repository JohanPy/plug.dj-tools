// ==UserScript==
// @name         plug.dj.tools
// @namespace    https://github.com/CopperFr/plug.dj-tools/
// @version      1.2.1
// @description  Some tools for plug.dj
// @author       CopperFr
// @match        https://plug.dj/*
// @grant        none
// ==/UserScript==

(function() {
let script = document.createElement('script');
script.text = "if (typeof plugDJToolsExtensionUninstall == 'function') plugDJToolsExtensionUninstall();";
(document.head || document.documentElement).appendChild(script);
script.remove();

script = document.createElement('script');
script.src = chrome.runtime.getURL('tools.js');
script.onload = function()
{
  this.remove();
};
(document.head || document.documentElement).appendChild(script);;
})();

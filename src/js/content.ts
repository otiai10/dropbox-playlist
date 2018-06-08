/// <reference types="chrome" />
import * as chomex from "chomex";

(() => {

  const createControlBar = (prev, next): Node => {
    const bar = document.createElement("div");
    bar.id = "control-bar";
    const here = new URL(location.href);
    if (prev) {
      here.searchParams.set("preview", prev);
      const a = document.createElement("a");
      a.setAttribute("href", here.toString());
      a.innerText = "← " + prev;
      a.style.cssFloat = "left";
      bar.appendChild(a);
    }
    if (next) {
      here.searchParams.set("preview", next);
      const a = document.createElement("a");
      a.setAttribute("href", here.toString());
      a.innerText = next + " →";
      a.style.cssFloat = "right";
      bar.appendChild(a);
    }
    return bar;
  };

  const router = new chomex.Router();
  router.on("/ping", () => ({url: location.href}));
  router.on("/control/show", msg => {
    const {prev, next} = msg;
    const controlBar = createControlBar(prev, next);
    if (document.querySelector("div#control-bar")) return;
    document.querySelector("div.preview-video__wrapper").appendChild(controlBar);
  });
  chrome.runtime.onMessage.addListener(router.listener());

  const client = new chomex.Client(chrome.runtime);
  const init = () => {
    const btn = document.createElement("button");
    btn.innerText = chrome.i18n.getMessage("btn_create_playlist");
    btn.addEventListener("click", () => {
      const links = Array.from<Element>(document.querySelectorAll("li.sl-grid-cell")).map(e => {
        return e.querySelector("a.sl-link").getAttribute("href");
      });
      client.message("/playlist/register", {links}).then(res => {
        console.log("OK", res);
      }).catch(err => {
        console.log("NG", err);
      });
    });
    const box = document.querySelector("div.sl-grid-header");
    box.appendChild(btn);
  };

  const main = () => {

    const here = new URL(location.href);
    const preview = here.searchParams.get("preview");
    if (preview) return;

    const onAllLoaded = setInterval(() => {
      const loading = document.querySelector("div.sl-loading-indicator");
      if (loading) return;
      clearInterval(onAllLoaded);
      init();
    });
  };
  window.onload = main;
})();

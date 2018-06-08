/// <reference types="chrome" />
import * as chomex from "chomex";

(() => {

  const client = new chomex.Client(chrome.runtime);

  const playNext = (next: string) => {
    const url = new URL(location.href);
    url.searchParams.set("preview", next);
    moveTo(url.toString());
  };

  const moveTo = (url) => {
    history.pushState({}, "", url);
    client.message("/playlist/control", {current: url}).then(({data}) => {
      const {prev, next, autoplay} = data;
      upsertControlBar(prev, next, autoplay);
      updateAutoplayStatus(autoplay, next);
    });
  };

  const updateAutoplayStatus = (autoplay, next) => {
    const video = document.querySelector("video");
    if (autoplay) {
      video.onloadeddata = () => video.play();
      video.onended = () => playNext(next);
    } else {
      video.onloadeddata = () => {/* do nothing */};
      video.onended = () => {/* do nothing */};
    }
    client.message("/playlist/autoplay", {autoplay});
  };

  const createControlBar = (prev, next, autoplay): Node => {
    const bar = document.createElement("div");
    bar.style.display = "flex";
    bar.id = "control-bar";
    // {{{ Left
    if (prev) {
      const here = new URL(location.href);
      const wrapper = document.createElement("div");
      wrapper.style.flex = "1";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "flex-start";
      here.searchParams.set("preview", prev);
      const a = document.createElement("a");
      a.addEventListener("click", () => moveTo(here.toString()));
      a.innerText = "← " + prev;
      wrapper.appendChild(a);
      bar.appendChild(wrapper);
    }
    // }}}
    // {{{ Center
    const center = document.createElement("div");
    center.style.flex = "1";
    center.style.display = "flex";
    center.style.justifyContent = "center";
    const ap = document.createElement("label");
    ap.style.cursor = "pointer";
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.addEventListener("change", (ev) => {
      const checked = (ev.target as HTMLInputElement).checked;
      updateAutoplayStatus(checked, next);
    });
    if (autoplay) checkbox.setAttribute("checked", "true");
    ap.appendChild(checkbox);
    ap.insertAdjacentText("beforeend", chrome.i18n.getMessage("control_autoplay"));
    center.appendChild(ap);
    bar.appendChild(center);
    // }}}
    // {{{ Right
    if (next) {
      const here = new URL(location.href);
      const wrapper = document.createElement("div");
      wrapper.style.flex = "1";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "flex-end";
      here.searchParams.set("preview", next);
      const a = document.createElement("a");
      a.addEventListener("click", () => moveTo(here.toString()));
      a.innerText = next + " →";
      a.style.cssFloat = "right";
      wrapper.appendChild(a);
      bar.appendChild(wrapper);
    }
    // }}}
    return bar;
  };

  const upsertControlBar = (prev, next, autoplay) => {
    const exists = document.querySelector("div#control-bar");
    if (exists) exists.remove();
    updateAutoplayStatus(autoplay, next);
    const controlBar = createControlBar(prev, next, autoplay);
    document.querySelector("div.preview-video__wrapper").appendChild(controlBar);
  };

  const router = new chomex.Router();
  router.on("/control/show", msg => {
    const {prev, next, autoplay} = msg;
    upsertControlBar(prev, next, autoplay);
  });
  chrome.runtime.onMessage.addListener(router.listener());

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

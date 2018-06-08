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
    const onVideoRendered = setInterval(() => {
      const video = document.querySelector("video");
      if (!video) return;
      clearInterval(onVideoRendered);
      if (autoplay) {
        video.onloadeddata = () => video.play();
        video.onended = () => playNext(next);
      } else {
        video.onloadeddata = () => {/* do nothing */};
        video.onended = () => {/* do nothing */};
      }
      client.message("/playlist/autoplay", {autoplay});
    });
  };

  const createControlBar = (prev, next, autoplay): Node => {
    const bar = document.createElement("div");
    bar.style.display = "flex";
    bar.id = "control-bar";
    // {{{ Left
    const left = document.createElement("div");
    left.style.flex = "1";
    left.style.display = "flex";
    left.style.justifyContent = "flex-start";
    if (prev) {
      const here = new URL(location.href);
      here.searchParams.set("preview", prev);
      const a = document.createElement("a");
      a.addEventListener("click", () => moveTo(here.toString()));
      a.innerText = "← " + prev;
      left.appendChild(a);
    }
    bar.appendChild(left);
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
    const right = document.createElement("div");
    right.style.flex = "1";
    right.style.display = "flex";
    right.style.justifyContent = "flex-end";
    if (next) {
      const here = new URL(location.href);
      here.searchParams.set("preview", next);
      const a = document.createElement("a");
      a.addEventListener("click", () => moveTo(here.toString()));
      a.innerText = next + " →";
      a.style.cssFloat = "right";
      right.appendChild(a);
    }
    bar.appendChild(right);
    // }}}
    return bar;
  };

  const upsertControlBar = (prev, next, autoplay) => {
    const exists = document.querySelectorAll("div#control-bar");
    if (exists) Array.from(exists).map(e => e.remove());
    updateAutoplayStatus(autoplay, next);
    const controlBar = createControlBar(prev, next, autoplay);
    const onWrapperRendered = setInterval(() => {
      const wrapper = document.querySelector("div.preview-video__wrapper");
      if (!wrapper) return;
      clearInterval(onWrapperRendered);
      wrapper.appendChild(controlBar);
    });
  };

  const router = new chomex.Router();
  router.on("/control/show", msg => {
    const {prev, next, autoplay} = msg;
    setTimeout(() => upsertControlBar(prev, next, autoplay), 100);
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
        window.alert(chrome.i18n.getMessage("dialog_registered", [res.data.count, res.data.id]));
        btn.remove();
      }).catch(err => {
        window.alert(chrome.i18n.getMessage("dialog_register_error", JSON.stringify(err)));
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

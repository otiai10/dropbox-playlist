import * as chomex from "chomex";

import {
  Playlist,
} from "../models";

export function RegisterPlaylist(msg) {
  const url = new URL(this.sender.url);
  const id = url.host + url.pathname;
  const previews = msg.links.map(link => link.split("/").splice(-1)[0].replace(/\?.*$/, ""));
  const pl = Playlist.new({_id: id, previews});
  pl.save();
  return {
    registered: true,
  };
}

export function OnTabUpdated(id: number, info: chrome.tabs.TabChangeInfo /* , tab: chrome.tabs.Tab */) {
  if (info.status !== "complete") return;
  // FIXME: the "tab" doesn't have URL, unnable to know if it's dropbox ;(
  const client = chomex.Client.for(chrome.tabs, id);
  client.message("/ping").then(res => {
    const url = new URL(res.data.url);
    const preview = url.searchParams.get("preview");
    if (!preview) return;
    const plid = url.host + url.pathname;
    const playlist: any = Playlist.find(plid); // TODO: Fix chomex for typings
    if (!playlist) return;
    const index = playlist.previews.indexOf(preview);
    const prev = playlist.previews[index - 1];
    const next = playlist.previews[index + 1];
    client.message("/control/show", {prev, next});
  }).catch(err => ({/* do nothing */}));
}

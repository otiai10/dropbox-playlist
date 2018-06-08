import * as chomex from "chomex";

import {
  Playlist,
} from "../models";

/**
 * toggle autoplay setting for this playlist.
 */
export function AutoplayPlaylist(msg) {
  const autoplay = msg.autoplay;
  const url = new URL(this.sender.url);
  const id = url.host + url.pathname;
  const pl = Playlist.find<Playlist>(id);
  if (!pl) return;
  pl.autoplay = autoplay;
  return pl.save();
}

/**
 * get information for creating control bar.
 */
export function ControlPlaylist(msg) {
  const url = new URL(msg.current);
  const id = url.host + url.pathname;
  const playlist = Playlist.find<Playlist>(id);
  if (!playlist) return;
  const index = playlist.previews.indexOf(url.searchParams.get("preview"));
  const prev = playlist.previews[index - 1];
  const next = playlist.previews[index + 1];
  return {prev, next, autoplay: playlist.autoplay};
}

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
    const playlist = Playlist.find<Playlist>(plid);
    if (!playlist) return;
    const index = playlist.previews.indexOf(preview);
    const prev = playlist.previews[index - 1];
    const next = playlist.previews[index + 1];
    client.message("/control/show", {prev, next, autoplay: playlist.autoplay});
  }).catch(err => ({/* do nothing */}));
}

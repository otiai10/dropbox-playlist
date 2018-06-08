import * as chomex from "chomex";

import {
  AutoplayPlaylist,
  ControlPlaylist,
  OnTabUpdated,
  RegisterPlaylist,
} from "./controllers";

const router = new chomex.Router();
router.on("/playlist/register", RegisterPlaylist);
router.on("/playlist/autoplay", AutoplayPlaylist);
router.on("/playlist/control", ControlPlaylist);

chrome.runtime.onMessage.addListener(router.listener());

chrome.tabs.onUpdated.addListener(OnTabUpdated);

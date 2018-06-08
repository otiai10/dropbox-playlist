import * as chomex from "chomex";

import {
  OnTabUpdated,
  RegisterPlaylist,
} from "./controllers";

const router = new chomex.Router();
router.on("/playlist/register", RegisterPlaylist);

chrome.runtime.onMessage.addListener(router.listener());

chrome.tabs.onUpdated.addListener(OnTabUpdated);

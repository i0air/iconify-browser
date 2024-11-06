import type { IconifyInfo, IconifyJSON } from "@iconify/types";
import { BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import { readFile } from "fs/promises";
import { join } from "path";
import type { IconModel } from "../types/icon-model";

interface StoreState {
  infos: Map<string, IconifyInfo>;
  jsons: Map<string, IconifyJSON>;
  icons: IconModel[];
}

const store: StoreState = { infos: new Map(), jsons: new Map(), icons: [] };

export function iconifyLoader(win: BrowserWindow) {
  let basePath = "";

  if (isDev) {
    basePath = join(process.cwd(), "node_modules/@iconify/json");
  } else {
    basePath = join(process.env.VITE_PUBLIC, "iconify");
  }

  let n = 0;
  let total = 1;

  const readCollections = async () => {
    const filePath = join(basePath, "collections.json");
    const content = await readFile(filePath, { encoding: "utf8" });
    const collections = JSON.parse(content) as { [key: string]: IconifyInfo };
    const ops: { label: string; value: string }[] = [];

    if (collections) {
      store.icons.length = 0;
      const keys = Object.keys(collections).sort((a, b) => a.localeCompare(b));
      const vals = Object.values(collections);
      const keylen = Math.max(...keys.map((k) => k.length));
      const vallen = Math.max(...vals.map((v) => v.name.length));

      total = keys.length;
      for (const key of keys) {
        const info = collections[key];
        store.infos.set(key, info);
        ops.push({ value: key, label: `${info.name.padEnd(vallen, " ")} ${key.padEnd(keylen, " ")} ${info.total || 0}` });
        await readIcons(key);
        n++;
        const percentage = Math.round((n / total) * 1000) / 10;
        win.webContents.send("progress", percentage);
      }
    }

    win.webContents.send("ready", ops);
  };

  const readIcons = async (key: string) => {
    const filePath = join(basePath, `json/${key}.json`);
    const content = await readFile(filePath, { encoding: "utf8" });
    const collection = JSON.parse(content) as IconifyJSON;

    if (collection) {
      store.jsons.set(key, collection);
      prepare(collection);
    }
  };

  const prepare = (collection: IconifyJSON) => {
    const keys = Object.keys(collection.icons);
    for (const key of keys) {
      const icon = collection.icons[key] as IconModel;
      let iw: number | undefined;
      let ih: number | undefined;
      if (collection.info?.height) {
        if (Array.isArray(collection.info.height) && collection.info.height.length > 1) {
          iw = collection.info.height[0];
          ih = collection.info.height[1];
        } else {
          iw = collection.info.height as number;
          ih = iw;
        }
      }
      const width = icon.width || collection.width || collection.info?.displayHeight || iw || 256;
      const height = icon.height || collection.height || collection.info?.displayHeight || ih || 256;
      icon.prefix = collection.prefix;
      icon.id = key;
      icon.width = width;
      icon.height = height;
      store.icons.push(icon);
    }
  };

  const query = (keyword: string, options?: { collection?: string; offset?: number; take?: number }) => {
    let result: IconModel[];

    if (options?.collection) {
      result = store.icons.filter((i) => i.prefix === options.collection && i.id.indexOf(keyword) >= 0);
    } else {
      result = store.icons.filter((i) => i.id.indexOf(keyword) >= 0);
    }

    const offset = options?.offset || 0;
    const total = result.length;
    const response = result.slice(offset, offset + (options?.take || 100));
    win.webContents.send("result", response, total);
  };

  ipcMain.on("mounted", () => readCollections());

  ipcMain.on("query", (_, ...args) => query(args[0], args[1]));
}

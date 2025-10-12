import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GLTF } from "three/examples/jsm/Addons.js";

export type AssetType = "gltf";

interface IAsset {
  id: string;
  type: AssetType;
  path: string;
}

interface AssetsState {
  status: "pending" | "ready";
  percent: number;
  loadedAssets: Record<string, any>;
}

export const assetsToLoad: IAsset[] = [
  { id: "avatar", type: "gltf", path: "/models/avatar.glb" },
];

export const assetsMap = new Map<string, GLTF>();

const initialState: AssetsState = {
  status: assetsToLoad.length ? "pending" : "ready",
  percent: 0,
  loadedAssets: {},
};

export const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    onLoadAsset: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.loadedAssets[id] = true;

      const cntLoaded = Object.keys(state.loadedAssets).length;
      const cntTotal = assetsToLoad.length;

      state.percent = (cntLoaded / Math.max(cntTotal, 1)) * 100;
      if (cntLoaded === cntTotal) state.status = "ready";
    },
  },
});

export const { onLoadAsset } = assetsSlice.actions;

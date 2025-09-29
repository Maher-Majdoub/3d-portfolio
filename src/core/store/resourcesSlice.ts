import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const resoucesToLoad = [
  { id: "rapier", type: "module", path: "@dimforge/rapier3d" },
];

interface ResourcesState {
  status: "pending" | "ready";
  loadedResources: Record<string, any>;
}

const initialState: ResourcesState = {
  status: "pending",
  loadedResources: {},
};

export const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    onLoadResource: (
      state,
      action: PayloadAction<{ id: string; resource: any }>
    ) => {
      const { id, resource } = action.payload;
      state.loadedResources[id] = resource;
    },
  },
});

export const { onLoadResource } = resourcesSlice.actions;

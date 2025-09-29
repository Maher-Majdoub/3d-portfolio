import { configureStore } from "@reduxjs/toolkit";
import { resourcesSlice } from "./resourcesSlice";

const store = configureStore({
  reducer: {
    assets: resourcesSlice.reducer,
  },
});

export default store;

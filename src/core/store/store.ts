import { configureStore } from "@reduxjs/toolkit";
import { assetsSlice } from "./assetsSlice";

const store = configureStore({
  reducer: {
    assets: assetsSlice.reducer,
  },
});

export default store;

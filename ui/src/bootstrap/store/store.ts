import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../app/store/rootReducer';

export function initializeStore(initialState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: true,
  });
}

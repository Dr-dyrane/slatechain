import storage from "redux-persist/lib/storage";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const safeStorage = typeof window !== "undefined" ? storage : noopStorage;

export default safeStorage;

import { withBase, withoutBase } from "./base-path.mjs";

export const publicUrl = (path) => withBase(path, import.meta.env.BASE_URL);
export const appPath = (pathname) => withoutBase(pathname, import.meta.env.BASE_URL);

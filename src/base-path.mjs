export function normalizeBase(base = "/") {
  if (!base || base === "/") return "/";
  if (!/^\/[A-Za-z0-9_./-]*$/.test(base) || base.includes("..") || base.includes("//")) {
    throw new Error("PAGES_BASE_PATH must be a root-relative path, such as /portfolio/.");
  }
  return `${base.replace(/\/+$/, "")}/`;
}

export function withBase(value, base = "/") {
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
  return normalizeBase(base) + value.replace(/^\.?\//, "");
}

export function withoutBase(pathname, base = "/") {
  const prefix = normalizeBase(base);
  let path = pathname;
  if (prefix !== "/") {
    if (path === prefix.slice(0, -1)) path = "/";
    else if (path.startsWith(prefix)) path = `/${path.slice(prefix.length)}`;
    else return "/not-found";
  }
  return path.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
}

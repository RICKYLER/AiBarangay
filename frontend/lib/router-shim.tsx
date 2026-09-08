'use client';

/**
 * Router shim — react-router-dom API implemented over Next.js navigation.
 *
 * The migrated pages were built with react-router (<Link>, <NavLink>,
 * useNavigate …). Rather than rewriting 31 files in one pass, they import
 * this shim instead. New code should prefer next/link + next/navigation
 * directly; this file exists so both worlds interoperate.
 */
import React from 'react';
import NextLink from 'next/link';
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

/* Anchor props we forward to NextLink (aria-*, mouse handlers, …). */
type ForwardedAnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'className' | 'style' | 'children' | 'onClick'
>;

type LinkProps = ForwardedAnchorProps & {
  to: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  'data-tip'?: string;
};

export function Link({ to, children, className, style, onClick, ...rest }: LinkProps) {
  return (
    <NextLink
      href={to}
      className={className}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </NextLink>
  );
}

type NavLinkProps = ForwardedAnchorProps & {
  to: string;
  end?: boolean;
  className?: string | ((args: { isActive: boolean }) => string | undefined);
  style?: React.CSSProperties | ((args: { isActive: boolean }) => React.CSSProperties | undefined);
  children?: React.ReactNode | ((args: { isActive: boolean }) => React.ReactNode);
  onClick?: (e: React.MouseEvent) => void;
  'data-tip'?: string;
};

export function NavLink({ to, end, children, className, style, onClick, ...rest }: NavLinkProps) {
  const pathname = usePathname() || '/';
  const isActive = end
    ? pathname === to
    : to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

  const cls = typeof className === 'function' ? className({ isActive }) : className;
  const sty = typeof style === 'function' ? style({ isActive }) : style;
  const kids = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <NextLink href={to} className={cls} style={sty} onClick={onClick} {...rest}>
      {kids}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to: string | number, opts?: { replace?: boolean }) => {
      if (to === -1) router.back();
      else if (opts?.replace) router.replace(String(to));
      else router.push(String(to));
    },
    [router]
  );
}

export function useLocation() {
  const pathname = usePathname() || '/';
  /* Read the query string from the browser rather than Next's
     useSearchParams() — that hook forces a Suspense boundary during
     static prerender, which the migrated layouts don't have. Only
     `pathname` is navigation-reactive; pages that need live query
     params use useSearchParams() (wrapped in Suspense). */
  const [search, setSearch] = React.useState('');
  React.useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);
  return { pathname, search, hash: '', key: '' };
}

/**
 * Same API react-router exposes: `[searchParams, setSearchParams]`.
 * Next's useSearchParams() returns the params object directly — the
 * destructuring pages do (`const [searchParams] = useSearchParams()`)
 * would otherwise grab the first [key, value] entry of the iterable
 * instead of the params object, and `.get()` would throw. The setter
 * accepts an object (or an updater fn) and replaces the query string.
 */
export function useSearchParams(): [
  ReturnType<typeof useNextSearchParams>,
  (next: Record<string, string> | ((prev: URLSearchParams) => URLSearchParams)) => void,
] {
  const params = useNextSearchParams();
  const router = useRouter();
  const setSearchParams = React.useCallback(
    (next: Record<string, string> | ((prev: URLSearchParams) => URLSearchParams)) => {
      const prev = new URLSearchParams(window.location.search);
      const sp = typeof next === 'function' ? next(prev) : new URLSearchParams(next ?? {});
      const qs = sp.toString();
      router.replace(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    },
    [router]
  );
  return [params, setSearchParams];
}

export function useParams(): Record<string, string | string[]> {
  return (useNextParams() as Record<string, string | string[]>) || {};
}

/**
 * In Next, a layout renders {children} — no <Outlet />. The three portal
 * layouts were converted during migration; this stub catches any that
 * were missed so the failure is loud and obvious in dev.
 */
export function Outlet(): never {
  throw new Error('<Outlet /> found during Next.js migration — replace with {children} in the layout.');
}

/** react-router's <Navigate to=… /> → redirect from an effect. */
export function Navigate({ to }: { to: string }): null {
  const router = useRouter();
  React.useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}

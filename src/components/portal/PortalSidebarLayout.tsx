'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

export type PortalNavItem = { href: string; label: string };

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

type Props = {
  storageKey: string;
  navItems: PortalNavItem[];
  header: React.ReactNode;
  children: React.ReactNode;
};

export default function PortalSidebarLayout({
  storageKey,
  navItems,
  header,
  children,
}: Props) {
  const pathname = usePathname() ?? '';
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      setSidebarHidden(v === '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const hideSidebar = useCallback(() => {
    setSidebarHidden(true);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const showSidebar = useCallback(() => {
    setSidebarHidden(false);
    try {
      localStorage.setItem(storageKey, '0');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const linkBase =
    'flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors';
  const linkIdle = 'text-gray-700 hover:bg-gray-100';
  const linkActive =
    'bg-blue-50 text-blue-900 font-semibold ring-1 ring-inset ring-blue-200/80 shadow-sm';

  return (
    <div className="flex h-screen bg-gray-50">
      {!sidebarHidden && (
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
          <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200">
            <span className="font-bold text-lg text-gray-900 truncate">Denti-Code</span>
            <button
              type="button"
              onClick={hideSidebar}
              className="shrink-0 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Hide navigation panel"
              title="Hide navigation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkBase} ${active ? linkActive : linkIdle}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <LogoutButton />
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-stretch min-h-[4.5rem] border-b border-gray-200 bg-white shadow-sm shrink-0">
          {sidebarHidden && (
            <button
              type="button"
              onClick={showSidebar}
              className="shrink-0 px-3 border-r border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
              aria-label="Show navigation panel"
              title="Show navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">{header}</div>
        </div>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

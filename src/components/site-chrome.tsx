"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SiteChromeProps = {
  /** Fixed header, cursor, progress bar. */
  before: ReactNode;
  /** Footer, action bar, assistant, cookie banner. */
  after: ReactNode;
  /** The page itself; always rendered. */
  children: ReactNode;
};

/**
 * The marketing chrome is rendered from the root layout. The admin portal is
 * a self-contained tool, so it opts out of all of it. One pathname check
 * decides both slots.
 */
export function SiteChrome({ before, after, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <>
      {isAdmin ? null : before}
      {children}
      {isAdmin ? null : after}
    </>
  );
}

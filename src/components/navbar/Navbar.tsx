'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import { api } from '@/trpc/react';
import { Button } from '../ui/button';

const routes: { title: string; href: string }[] = [
  { title: 'Features', href: '#features' },
  { title: 'Resources', href: '#resources' },
  { title: 'Pricing', href: '#pricing' },
];

const Navbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const { data: user, isLoading } = api.users.getUserWithInnerCount.useQuery();

  return (
    <div className="fixed top-0 z-40 flex h-16 w-full items-center justify-between gap-4 bg-background px-6 lg:px-14">
      <div className="mr-auto flex items-center">
        <Link href={'/'} className="shrink-0">
          <h1 className="text-2xl font-bold text-accent-foreground">saga</h1>
        </Link>
        <div className="sparkles relative hidden w-full justify-end gap-1 bg-background px-4 py-2 sm:flex">
          {isLoading ? null : (
            <>
              {user?.ideasCount && user?.ideasCount > 0 ? (
                <Link
                  href={'/ideas'}
                  className={` text-sm inline-flex h-10 w-full items-center px-4 py-2 text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
                >
                  Ideas
                </Link>
              ) : null}
              {user?.writersCount && user?.writersCount > 0 ? (
                <Link
                  href={'/writers'}
                  className={` text-sm inline-flex h-10 w-full items-center px-4 py-2 text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
                >
                  Writers
                </Link>
              ) : null}
              {user?.scriptsCount && user?.scriptsCount > 0 ? (
                <Link
                  href={'/scripts'}
                  className={` text-sm inline-flex h-10 w-full items-center px-4 py-2 text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
                >
                  Scripts
                </Link>
              ) : null}
              {user?.voiceoversCount && user?.voiceoversCount > 0 ? (
                <Link
                  href={'/voiceovers'}
                  className={` text-sm inline-flex h-10 w-full items-center px-4 py-2 text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
                >
                  Voiceovers
                </Link>
              ) : null}
              {user?.videosCount && user?.videosCount > 0 ? (
                <Button asChild variant="ghost">
                  <Link
                    href={'/videos'}
                    className={` text-sm inline-flex h-10 w-full items-center px-4 py-2 text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
                  >
                    Videos
                  </Link>
                </Button>
              ) : null}
            </>
          )}
        </div>
        {/* <div className="hidden w-full justify-end gap-1 bg-background px-4 py-2 sm:flex">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={`inline-flex h-10 w-full items-center px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
            >
              {route.title}
            </Link>
          ))}
        </div> */}
      </div>

      <DarkModeToggle />

      {children}

      {menuOpen && <MobileMenu toggleMenu={toggleMenu}>{children}</MobileMenu>}

      <button onClick={toggleMenu} className="sm:hidden">
        {menuOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <Bars3Icon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};

const MobileMenu: React.FC<{
  toggleMenu: () => void;
  children: React.ReactNode;
}> = ({ toggleMenu, children }) => {
  return (
    <div className="absolute right-0 top-16 flex h-[calc(100vh-64px)] w-full flex-col">
      <div className="flex  w-full grow flex-col gap-1 bg-background px-4 pb-2 sm:hidden">
        {routes.map((route, index) => (
          <Link
            key={index}
            href={route.href}
            onClick={toggleMenu}
            className={`text-sm inline-flex h-10 w-full items-center text-muted-foreground transition-colors hover:text-accent-foreground sm:w-auto`}
          >
            {route.title}
          </Link>
        ))}
        {children}
      </div>
      <div className="h-screen w-full bg-background/60 sm:hidden" />
    </div>
  );
};

export default Navbar;

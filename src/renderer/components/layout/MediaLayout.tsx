import React from 'react';
import { Sidebar } from './Sidebar';

export function MediaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar className="hidden lg:block w-80" />
      <div className="grow lg:border-l basis-full min-w-0">{children}</div>
    </>
  );
}

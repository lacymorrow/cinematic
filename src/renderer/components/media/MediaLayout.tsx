import React from 'react';
import { Sidebar } from '../layout/Sidebar';

export function MediaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar className="hidden lg:block w-60 lg:w-80" />
      <div className="grow lg:border-l basis-full min-w-0">{children}</div>
    </>
  );
}

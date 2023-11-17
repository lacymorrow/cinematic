import React from 'react';

const openLink = (url: string) => {
  window.electron.openUrl(url);
};

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} onClick={() => openLink(href)} className="flex gap-2">
      {children}
    </a>
  );
}

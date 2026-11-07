import { ReactNode } from 'react';

interface Props {
  sidebar: ReactNode;
  header: ReactNode;
  zone: string;
  children: ReactNode;
}

export default function AppShell({ sidebar, header, zone, children }: Props) {
  return (
    <div className="shell">
      {sidebar}
      <div className="main">
        {header}
        <main className={`content ${zone}`}>{children}</main>
      </div>
    </div>
  );
}

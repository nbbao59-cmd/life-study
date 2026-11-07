import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export default function PageTitle({ icon, title, subtitle }: Props) {
  return (
    <div className="page-title">
      <div className="ico">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

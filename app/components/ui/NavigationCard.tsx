// app/components/ui/NavigationCard.tsx
'use client';

import Link from 'next/link';
import clsx from 'clsx';
import styles from './NavigationCard.module.css';

type NavigationCardProps = {
  title: string;
  description: string;
  href: string;
  className?: string;
  dataCard?: boolean;
};

export default function NavigationCard({
  title,
  description,
  href,
  className,
  dataCard = false,
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      scroll
      className={clsx(styles.card, className)}
      aria-label={`${title} page`}
      data-card={dataCard ? '' : undefined}
    >
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
}

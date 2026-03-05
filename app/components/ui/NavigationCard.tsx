'use client';

import Link from 'next/link';
import styles from './NavigationCard.module.css';

type NavigationCardProps = {
  title: string;
  description: string;
  href: string;
  className?: string;
};

export default function NavigationCard({
  title,
  description,
  href,
  className,
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      className={[styles.card, className].filter(Boolean).join(' ')}
    >
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
}

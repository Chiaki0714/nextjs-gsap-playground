// app/experiments/layout.tsx
import Link from 'next/link';
import styles from './layout.module.css';

export default function ExperimentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.main}>
      <Link href='/' className={styles.back} aria-label='Back to home'>
        ← Back
      </Link>

      <section className={styles.before}>
        <h2>Before Section</h2>
      </section>

      {children}

      <section className={styles.after}>
        <h2>After Section</h2>
      </section>
    </main>
  );
}

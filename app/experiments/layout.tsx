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
        <div className={styles.container}>
          <p className={styles.kicker}>Experiments</p>
          <h2 className={styles.sectionTitle}>Before Section</h2>
        </div>
      </section>

      {children}

      <section className={styles.after}>
        <div className={styles.container}>
          <p className={styles.kicker}>Experiments</p>
          <h2 className={styles.sectionTitle}>After Section</h2>
        </div>
      </section>
    </main>
  );
}

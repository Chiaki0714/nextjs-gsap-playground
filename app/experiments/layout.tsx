import Link from 'next/link';
import styles from './layout.module.css';

type ExperimentsLayoutProps = {
  children: React.ReactNode;
};

export default function ExperimentsLayout({
  children,
}: ExperimentsLayoutProps) {
  return (
    <main className={styles.main}>
      <Link href='/' className={styles.back}>
        <span aria-hidden='true'>←</span>
        <span>Back</span>
      </Link>

      <section className={styles.edgeSection}>
        <div className='container'>
          <div className={styles.inner}>
            <p className={styles.kicker}>Experiments</p>
            <h1 className={styles.sectionTitle}>Before Section</h1>
          </div>
        </div>
      </section>

      {children}

      <section className={styles.edgeSection}>
        <div className='container'>
          <div className={styles.inner}>
            <p className={styles.kicker}>Experiments</p>
            <h2 className={styles.sectionTitle}>After Section</h2>
          </div>
        </div>
      </section>
    </main>
  );
}

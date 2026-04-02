import Image from 'next/image';

import styles from './page.module.css';
import RevealText from './RevealText';
import { CONTENT_SECTIONS, HERO_IMAGE, PORTRAIT_IMAGE } from './content';

export default function TextLineRevealPage() {
  const footerLinks = ['Twitter', 'LinkedIn', 'Instagram', 'Awwwards', 'Email'];

  return (
    <section className={styles.wrapper} aria-label='Text line reveal layout'>
      <nav className={styles.nav} aria-label='Section navigation'>
        <div className={styles.navGroup}>
          <div className={styles.navBlock}>
            <span className={styles.navLabel}>Greyloom</span>
          </div>

          <div className={styles.navBlock}>
            <span className={styles.navLabel}>Home</span>
            <span className={styles.navLabel}>Projects</span>
            <span className={styles.navLabel}>About</span>
            <span className={styles.navLabel}>Lab</span>
          </div>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navLabel}>Let&apos;s talk</span>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden='true'>
          <Image
            className={styles.heroImage}
            src={HERO_IMAGE.src}
            alt=''
            fill
            priority
            sizes='100vw'
          />
        </div>

        <header className={styles.heroHeader}>
          <RevealText delay={0.35}>
            <h1 className={styles.displayTitle}>
              We craft identities and experiences for the bold.
            </h1>
          </RevealText>
        </header>
      </section>

      <section className={styles.intro}>
        <RevealText>
          <p className={styles.eyebrow}>
            Design &amp; Strategy for the Vision-Driven
          </p>
        </RevealText>

        <div className={styles.introHeader}>
          <RevealText>
            <h2 className={styles.sectionTitle}>
              We partner with founders, innovators, and change-makers to shape
              brands that resonate. From first lines of code to global launches,
              we bring focus, elegance, and intent to every stage.
            </h2>
          </RevealText>
        </div>
      </section>

      <section className={styles.portraitSection}>
        <div className={styles.portraitFrame}>
          <Image
            className={styles.portraitImage}
            src={PORTRAIT_IMAGE.src}
            alt={PORTRAIT_IMAGE.alt}
            fill
            sizes='(max-width: 48rem) 100vw, 20vw'
          />
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyTitleColumn}>
          <RevealText>
            <h2 className={styles.sectionTitle}>
              The Story Behind
              <br />
              Our Stillness
            </h2>
          </RevealText>
        </div>

        <div className={styles.storyCopyColumn}>
          <RevealText>
            {CONTENT_SECTIONS.story.map(paragraph => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </RevealText>
        </div>
      </section>

      <section className={styles.philosophy}>
        <RevealText>
          <p className={styles.eyebrowInverse}>The Thought Beneath</p>
        </RevealText>

        <div className={styles.philosophyHeader}>
          <RevealText>
            <h2 className={styles.sectionTitleInverse}>
              We believe in the power of quiet conviction. In work that speaks
              softly but lingers long. In design as a tool for clarity, not
              decoration. We believe that the best ideas don&apos;t demand
              attention. Our philosophy is simple. Create with purpose.
            </h2>
          </RevealText>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerColumn}>
          <div className={styles.footerBlock}>
            <span className={styles.footerMeta}>Terms &amp; Conditions</span>
          </div>

          <div className={styles.footerBlock}>
            <RevealText>
              {footerLinks.map(label => (
                <p key={label} className={styles.footerLinkLabel}>
                  {label}
                </p>
              ))}
            </RevealText>
          </div>
        </div>

        <div className={styles.footerColumnSecondary}>
          <span className={styles.footerMeta}>Copyright Greyloom 2025</span>
        </div>
      </footer>
    </section>
  );
}

import Image from 'next/image';

import styles from './page.module.css';
import RevealText from './RevealText';
import { CONTENT_SECTIONS, HERO_IMAGE, PORTRAIT_IMAGE } from './content';

export default function TextLineRevealPage() {
  return (
    <section className={styles.wrapper} aria-label='Text line reveal layout'>
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

        <div className={styles.heroHeader}>
          <RevealText delay={0.35}>
            <h1 className={styles.displayTitle}>
              We craft identities and experiences for the bold.
            </h1>
          </RevealText>
        </div>
      </section>

      <section className={styles.about}>
        <RevealText>
          <p className={styles.eyebrow}>
            Design &amp; Strategy for the Vision-Driven
          </p>
        </RevealText>

        <div className={styles.aboutHeader}>
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
    </section>
  );
}

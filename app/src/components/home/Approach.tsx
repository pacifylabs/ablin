import { ArcLattice } from '@/components/motifs/ArcLattice';
import type { z } from 'zod';
import type { approachSchema } from '@/content/schema';
import styles from './home.module.css';

type ApproachData = z.infer<typeof approachSchema>;

/** The site's single bold moment: a genuine five-step sequence on the navy feature field. */
export function Approach({ data, id = 'approach-title' }: { data: ApproachData; id?: string }) {
  return (
    <section className={`${styles.approach} on-navy grain`} aria-labelledby={id}>
      <div className={styles.approachMotif}>
        <ArcLattice withPath={false} />
      </div>
      <div className="container">
        <header className={styles.approachHeader}>
          <p className={styles.approachKicker}>{data.kicker}</p>
          <h2 id={id}>{data.title}</h2>
          <p className={styles.approachLead}>{data.lead}</p>
        </header>
        <ol className={styles.steps}>
          {data.steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div className={styles.stepBody}>
                <h3>
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

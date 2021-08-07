import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'pre-enrolment',
    description: (
      <>
        On-board students right in the app... What's their personal data? What courses do they want to be enrolled in?
      </>
    ),
  },
  {
    title: 'payments',
    description: (
      <>
        Register payments from the students: how much, when, ... and create receipts for them!
      </>
    ),
  },
  {
    title: 'attendance',
    description: (
      <>
        Let teachers register attendance to their courses.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Navbar from "@repo/ui/navbar";
import styles from "./page.module.css";

export default function Home() {
  const stats = [
    ["24/7", "asset visibility"],
    ["9", "core views"],
    ["1", "shared UI system"],
  ] as const;

  const features = [
    ["Fast registration", "Simple onboarding for people, teams, and assets."],
    ["Transfer controls", "Track allocation, movement, and ownership changes."],
    ["Audit ready", "Keep records clean for reviews and reporting."],
  ] as const;

  const views = [
    ["/dashboard/overview", "Dashboard"],
    ["/dashboard/setup", "Setup & Assets"],
    ["/dashboard/transfer", "Transfer"],
    ["/dashboard/booking", "Booking"],
    ["/dashboard/maintainence", "Maintenance"],
    ["/dashboard/audit", "Audit"],
    ["/dashboard/reports", "Reports"],
    ["/dashboard/notifications", "Notifications"],
  ] as const;

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.badge}>AssetFlow platform</div>
          <h1>One clean place to register, manage, and report on assets.</h1>
          <p>
            Built with a simple, modern layout and the orange brand palette you
            asked for. This landing page is the entry point for all major views.
          </p>

          <div className={styles.ctas}>
            <Link href="/register" className={styles.primary}>
              Start registration
            </Link>
            <Link href="/dashboard/overview" className={styles.secondary}>
              Open dashboard
            </Link>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroMetricRow}>
            {stats.map(([value, label]) => (
              <div key={label} className={styles.metricCard}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.heroPreview}>
            <p>Dashboard quick actions</p>
            <div>
              <span>Register assets</span>
              <span>Assign ownership</span>
              <span>Generate reports</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="features">
        <div className={styles.sectionHeading}>
          <div className={styles.badge}>What it includes</div>
          <h2>Simple sections with strong hierarchy and branded orange accents.</h2>
        </div>

        <div className={styles.featureGrid}>
          {features.map(([title, description]) => (
            <article key={title} className={styles.featureCard}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="workflow">
        <div className={styles.sectionHeading}>
          <div className={styles.badge}>Workflow</div>
          <h2>Everything starts from registration and flows into the dashboard.</h2>
        </div>

        <div className={styles.workflowList}>
          <div className={styles.workflowStep}>
            <span>01</span>
            <div>
              <h3>Register</h3>
              <p>Capture the user or asset entry point at /register.</p>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span>02</span>
            <div>
              <h3>Manage</h3>
              <p>Use setup, transfer, booking, and maintenance views.</p>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span>03</span>
            <div>
              <h3>Review</h3>
              <p>Finish with audit and reporting screens.</p>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.panel} id="dashboard">
          <div className={styles.sectionHeading}>
            <div className={styles.badge}>Views</div>
            <h2>Jump into each screen already mapped in the web app.</h2>
          </div>

          <div className={styles.grid}>
            {views.map(([href, label]) => (
              <Link key={href} href={href} className={styles.card}>
                <span>{label}</span>
                <small>{href}</small>
              </Link>
            ))}
          </div>
        </div>

        <section className={styles.section} id="contact">
          <div className={styles.ctaBanner}>
            <div>
              <div className={styles.badge}>Get started</div>
              <h2>Ready to start wiring the actual features?</h2>
              <p>Build the real product views on top of this clean landing page.</p>
            </div>
            <Link href="/dashboard/overview" className={styles.primary}>
              Go to dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

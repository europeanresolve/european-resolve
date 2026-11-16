import type { Metadata } from "next";
import Link from "next/link";
import { LegacyHashRedirect } from "@/components/ui/LegacyHashRedirect";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "European Resolve",
  description:
    "Research, dialogue, and civic action to reinforce European security and democracy.",
};

export default function Home() {
  return (
    <>
      <LegacyHashRedirect />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.statement}>
            European Resolve is being built.
          </h1>
          <p className={styles.because}>
            {"We exist to turn Europe's concern into resolve, and resolve into action."}
          </p>
          <p className={styles.more}>
            <Link href="/about" className={styles.moreLink}>
              More about us
            </Link>
          </p>
          <div className={styles.divider} />
        </div>
      </section>
    </>
  );
}

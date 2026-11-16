import type { Metadata } from "next";
import { members } from "@/data/members";
import { MemberCard } from "@/components/ui/MemberCard";
import styles from "./page.module.css";

const BASE_URL = "https://european-resolve.org";

export const metadata: Metadata = {
  title: "About us | European Resolve",
  description:
    "The mission, history and team of European Resolve, an independent, non-partisan and pro-European civil society organisation based in Brussels.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <div className={styles.about}>
        <div className={styles.aboutInner}>
          <h1 className={styles.pageTitle}>About us</h1>

          <section id="mission" className={styles.mission}>
            <h2 className={styles.aboutHeading}>Mission</h2>
            <div className={styles.aboutText}>
              <p className={styles.lead}>
                {"We exist to turn Europe's concern into resolve, and resolve into action."}
              </p>
              <p>
                Our work brings together research, policy advocacy, public
                engagement and civic mobilisation, with the aim of producing
                evidence that decision-makers can use and helping citizens take
                part in the choices ahead. We are independent, non-partisan and
                pro-European.
              </p>
            </div>
          </section>

          <section id="history" className={styles.history}>
            <h2 className={styles.aboutHeading}>History</h2>
            <div className={styles.aboutText}>
              <p>
                {"In 2025, the discussion on using Russia's frozen assets to support Ukraine picked up again. Following it closely, a few of us felt we could no longer simply observe. We wanted to contribute."}
              </p>
              <p>
                {"There were seven of us, from different countries and professional backgrounds, with experience in policy, research, civic work and technology. We started meeting informally and called ourselves Frozen Assets Action. Our goal was to add new perspectives to the debate: to show that using the assets is legally sound, carefully designed, that the risks can be managed, and that it is a responsible way to support Ukraine's defence."}
              </p>
              <p>
                Over the following months, we realised this was more than a
                single campaign for us. The frozen assets debate reflected
                something broader that we kept coming back to in our
                conversations: Europe usually understands its challenges well,
                from the war on our continent to pressure on our democracies
                and our preparedness for crises. What is often harder is moving
                from analysis to action.
              </p>
              <p>
                We decided we wanted to work on exactly that, together and for
                the long term. So we founded an organisation and named it after
                what we hope to strengthen: European Resolve.
              </p>
            </div>
          </section>
        </div>
      </div>

      <section id="team" className={styles.team}>
        <div className={styles.teamInner}>
          <h2 className={styles.teamHeading}>Team</h2>
          <div className={styles.grid}>
            {members.map((member) => (
              <MemberCard key={member.slug} member={member} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

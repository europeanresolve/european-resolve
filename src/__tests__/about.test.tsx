import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AboutPage, { metadata } from "@/app/about/page";
import { members } from "@/data/members";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

const EM_DASH = "\u2014";

const LEAD =
  "We exist to turn Europe's concern into resolve, and resolve into action.";
const MISSION_BODY =
  "Our work brings together research, policy advocacy, public engagement and civic mobilisation, with the aim of producing evidence that decision-makers can use and helping citizens take part in the choices ahead. We are independent, non-partisan and pro-European.";
const HISTORY = [
  "In 2025, the discussion on using Russia's frozen assets to support Ukraine picked up again. Following it closely, a few of us felt we could no longer simply observe. We wanted to contribute.",
  "There were seven of us, from different countries and professional backgrounds, with experience in policy, research, civic work and technology. We started meeting informally and called ourselves Frozen Assets Action. Our goal was to add new perspectives to the debate: to show that using the assets is legally sound, carefully designed, that the risks can be managed, and that it is a responsible way to support Ukraine's defence.",
  "Over the following months, we realised this was more than a single campaign for us. The frozen assets debate reflected something broader that we kept coming back to in our conversations: Europe usually understands its challenges well, from the war on our continent to pressure on our democracies and our preparedness for crises. What is often harder is moving from analysis to action.",
  "We decided we wanted to work on exactly that, together and for the long term. So we founded an organisation and named it after what we hope to strengthen: European Resolve.",
];

describe("/about page", () => {
  it("renders one h1 About us and sections mission, history, team in order", () => {
    const { container } = render(<AboutPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "About us" }),
    ).toBeInTheDocument();
    const ids = Array.from(container.querySelectorAll("section[id]")).map(
      (s) => s.id,
    );
    expect(ids).toEqual(["mission", "history", "team"]);
  });

  it("renders the final Mission and History copy verbatim", () => {
    render(<AboutPage />);
    for (const text of [LEAD, MISSION_BODY, ...HISTORY]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("renders h2 Mission, History, Team and one h3 per member in order", () => {
    render(<AboutPage />);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Mission", "History", "Team"]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(members.map((m) => m.name));
  });

  it("exports title, description and canonical metadata", () => {
    expect(metadata.title).toBe("About us | European Resolve");
    expect(metadata.description).toBe(
      "The mission, history and team of European Resolve, an independent, non-partisan and pro-European civil society organisation based in Brussels.",
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://european-resolve.org/about",
    );
  });

  it("contains no em dash in rendered text or metadata", () => {
    const { container } = render(<AboutPage />);
    expect(container.textContent).not.toContain(EM_DASH);
    expect(String(metadata.title)).not.toContain(EM_DASH);
    expect(String(metadata.description)).not.toContain(EM_DASH);
  });
});

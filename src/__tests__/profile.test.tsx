import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import TeamMemberPage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/about/team/[slug]/page";
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

const EM_DASH = "—";
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("profile page", () => {
  it.each(members.map((m) => [m.slug, m] as const))(
    "%s renders breadcrumbs, heading and QR",
    async (slug, member) => {
      const { container } = render(await TeamMemberPage(params(slug)));

      const nav = within(
        screen.getByRole("navigation", { name: "Breadcrumb" }),
      );
      expect(nav.getAllByRole("listitem")).toHaveLength(3);
      expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute(
        "href",
        "/",
      );
      expect(nav.getByRole("link", { name: "About us" })).toHaveAttribute(
        "href",
        "/about",
      );
      const current = container.querySelector('[aria-current="page"]');
      expect(current?.textContent).toBe(member.name);

      expect(
        screen.getByRole("heading", { level: 1, name: member.name }),
      ).toBeInTheDocument();
      expect(container.querySelector("svg")).not.toBeNull();
      expect(container.textContent).not.toContain(EM_DASH);
    },
  );

  it.each(members.map((m) => [m.slug, m] as const))(
    "%s metadata has title, description and absolute canonical",
    async (slug, member) => {
      const meta = await generateMetadata(params(slug));
      expect(meta.title).toBe(`${member.name} | European Resolve`);
      expect(meta.description).toBe(
        `${member.name}, ${member.title} at European Resolve`,
      );
      expect(meta.alternates?.canonical).toBe(
        `https://european-resolve.org/about/team/${slug}`,
      );
      expect(String(meta.title)).not.toContain(EM_DASH);
      expect(String(meta.description)).not.toContain(EM_DASH);
    },
  );

  it("generateStaticParams returns every member slug", () => {
    expect(generateStaticParams()).toEqual(
      members.map((m) => ({ slug: m.slug })),
    );
  });

  it("unknown slug yields empty metadata and notFound", async () => {
    expect(await generateMetadata(params("no-such-member"))).toEqual({});
    await expect(TeamMemberPage(params("no-such-member"))).rejects.toThrow();
  });
});

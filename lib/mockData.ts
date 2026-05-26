import type { Campaign, ImpactItem } from "./types";

export const DEFAULT_IMPACTS: ImpactItem[] = [
  { id: "feed",        title: "Feed Children",       description: "Provide a week of meals for a child in need.",     amount: 35,  emoji: "🍞" },
  { id: "missions",    title: "Sponsor Missions",    description: "Send a missionary into the field for a day.",       amount: 125, emoji: "✈️" },
  { id: "churches",    title: "Build Churches",      description: "Help fund a chair, a pew, or a wall.",               amount: 250, emoji: "⛪" },
  { id: "scholarship", title: "Fund Scholarships",   description: "Open a door of education for one student.",          amount: 500, emoji: "🎓" },
  { id: "disaster",    title: "Disaster Relief",     description: "Bring emergency supplies to a family in crisis.",    amount: 150, emoji: "🛟" },
  { id: "families",    title: "Support Families",    description: "Cover rent or groceries for a struggling family.",   amount: 200, emoji: "🏠" },
  { id: "water",       title: "Clean Water",         description: "Bring clean water to a person for years.",           amount: 50,  emoji: "💧" },
  { id: "outreach",    title: "Local Outreach",      description: "Sponsor a neighborhood outreach event.",             amount: 75,  emoji: "🤝" },
];

export const SAMPLE_CAMPAIGN: Campaign = {
  slug: "convoy-of-hope",
  orgName: "Convoy of Hope",
  campaignName: "One Day Can Change Forever",
  visionStatement:
    "Together, we believe one day of generosity can ripple into someone's forever. Every gift feeds a family, brings clean water, and carries hope around the world.",
  givingLink: "https://convoyofhope.org/give",
  logoBackground: "light",
  accentColor: "#FBBF24",
  impactMessage:
    "Your One Day Offering joins thousands of others to fund missions, disaster relief, and community outreach this year.",
  impacts: DEFAULT_IMPACTS,
  kingdomImpactMode: true,
  createdAt: Date.now(),
};

export const DEMO_CAMPAIGNS: Campaign[] = [
  SAMPLE_CAMPAIGN,
  {
    slug: "hope-city-church",
    orgName: "Hope City Church",
    campaignName: "First Fruits 2026",
    visionStatement:
      "We believe the first day of our work belongs to the One who gave us every day. Bring your One Day Offering and watch what He does.",
    givingLink: "https://example.org/give",
    logoBackground: "light",
    accentColor: "#FBBF24",
    impactMessage:
      "This year, Hope City is sending teams to four nations and planting two new campuses. Your One Day fuels every mile.",
    impacts: DEFAULT_IMPACTS.slice(0, 6),
    kingdomImpactMode: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
];

import type { GearItem } from "./types";

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "padelmanual-21";

function amzn(asin: string) {
  return `https://www.amazon.co.uk/dp/${asin}?tag=${TAG}`;
}

export const gearItems: GearItem[] = [
  {
    slug: "best-padel-rackets-uk",
    title: "Best Padel Rackets UK 2025",
    category: "rackets",
    headline: "The only rackets worth buying right now.",
    intro: "We tested dozens so you don't have to. Whether you're picking up a racket for the first time or upgrading after six months of obsessive play, these are the ones we'd actually recommend to a friend.",
    products: [
      { name: "Head Zephyr UL", brand: "Head", price: "~£75", amazonUrl: amzn("B0D1WNXMCP"), verdict: "Lightweight graphene frame with power foam for centring wayward shots. An advanced racket at a mid-range price.", bestFor: "Intermediate to advanced players wanting control without weight" },
      { name: "Head Evo Speed", brand: "Head", price: "~£62", amazonUrl: amzn("B0D1WLKM7P"), verdict: "Lightweight, well-balanced, fibreglass hitting surface for softer feel and more power. The best entry point from a premium brand.", bestFor: "Beginners who want a quality racket from day one" },
      { name: "Wilson Optix V1", brand: "Wilson", price: "~£70", amazonUrl: amzn("B0DCCGVR7Q"), verdict: "Larger round head increases the hitting surface. Fibreglass weave gives consistent feel. Wilson build quality throughout.", bestFor: "Beginners and improvers wanting forgiveness" },
      { name: "Babolat Air Viper", brand: "Babolat", price: "~£150", amazonUrl: amzn("B0CQ2DDNB2"), verdict: "Diamond shape for power players. Stiff frame rewards clean technique. Not forgiving, but devastating when you connect.", bestFor: "Aggressive players with solid fundamentals" },
      { name: "Adidas Adipower CTRL 3.4", brand: "Adidas", price: "~£200", amazonUrl: amzn("B0CG9TZ8K1"), verdict: "Dual carbon fibre exoskeleton for rigidity and power. Special moulds improve spin feel. Top-tier engineering.", bestFor: "Advanced players wanting maximum control and spin" },
    ],
  },
  {
    slug: "best-padel-shoes-uk",
    title: "Best Padel Shoes UK 2025",
    category: "shoes",
    headline: "Grip, support, and durability — on indoor and outdoor courts.",
    intro: "The right shoes make a real difference on a padel court. You need lateral support for quick direction changes, grip that works on artificial grass without catching, and durability to handle the abrasive surface.",
    products: [
      { name: "Asics Gel-Padel Pro 5", brand: "Asics", price: "~£70", amazonUrl: amzn("B0BKJZ5ZXK"), verdict: "Gel cushioning, herringbone sole pattern for excellent grip on artificial grass. Reliable all-rounder.", bestFor: "All-court players wanting comfort and grip" },
      { name: "Head Sprint Pro 3.5", brand: "Head", price: "~£85", amazonUrl: amzn("B0BYJ2S9HT"), verdict: "Designed specifically for padel. Superior lateral support, durable outsole, breathable upper.", bestFor: "Players who move a lot and need support" },
      { name: "Adidas Barricade Padel", brand: "Adidas", price: "~£95", amazonUrl: amzn("B0CJ5Y3RVF"), verdict: "Adiwear outsole for extreme durability. Adiprene cushioning in the forefoot. Premium feel.", bestFor: "Players who wear through shoes quickly" },
    ],
  },
  {
    slug: "best-padel-balls-uk",
    title: "Best Padel Balls UK 2025",
    category: "balls",
    headline: "Lower pressure, longer rallies, more fun.",
    intro: "Padel balls look like tennis balls but have lower internal pressure for slower bounce off the walls. The difference matters more than you'd think.",
    products: [
      { name: "Head Padel Pro", brand: "Head", price: "~£6 (3 balls)", amazonUrl: amzn("B07G3H9CQZ"), verdict: "The most widely used padel ball in the world. Official ball of the World Padel Tour. Consistent bounce and excellent durability.", bestFor: "Everyone — the default choice for good reason" },
      { name: "Wilson Triniti Padel", brand: "Wilson", price: "~£7 (3 balls)", amazonUrl: amzn("B0948LZQF5"), verdict: "Plastomer core stays inflated 4x longer than standard balls. Comes in recyclable packaging.", bestFor: "Players wanting longer-lasting balls with less waste" },
      { name: "Babolat Padel Tour", brand: "Babolat", price: "~£6 (3 balls)", amazonUrl: amzn("B09NRCMQRT"), verdict: "Excellent feel and consistent performance. Premium wool felt for durability.", bestFor: "Club players and competitive matches" },
    ],
  },
  {
    slug: "best-padel-bags-uk",
    title: "Best Padel Bags & Accessories UK 2025",
    category: "bags",
    headline: "Carry your gear properly.",
    intro: "A dedicated padel bag keeps your rackets protected and your gear organised. Here are the bags we'd actually use ourselves.",
    products: [
      { name: "Head Core Padel Combi", brand: "Head", price: "~£35", amazonUrl: amzn("B0C9JXJHZ1"), verdict: "Fits 2-3 rackets plus shoes, balls, and accessories. Padded compartment protects your rackets. Simple, effective.", bestFor: "Most players — the all-rounder bag" },
      { name: "Adidas Control 3.3 Racket Bag", brand: "Adidas", price: "~£55", amazonUrl: amzn("B0D5MCQNK1"), verdict: "Thermally insulated racket compartment. Shoe pocket. Multiple storage zones. Premium materials.", bestFor: "Players wanting extra protection and organisation" },
      { name: "Wilson Super Tour Padel Bag", brand: "Wilson", price: "~£65", amazonUrl: amzn("B0BZ3Y4H8F"), verdict: "Thermoguard compartment keeps rackets safe. Two large main compartments. Classic Wilson build quality.", bestFor: "Serious players carrying multiple rackets" },
    ],
  },
];

export function getGearBySlug(slug: string): GearItem | undefined {
  return gearItems.find((g) => g.slug === slug);
}

export function getGearByCategory(category: string): GearItem[] {
  return gearItems.filter((g) => g.category === category);
}

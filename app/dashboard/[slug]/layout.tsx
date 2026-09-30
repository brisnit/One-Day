// The pages below are client-rendered shells that fetch the campaign in the
// browser, so their HTML is identical for every slug. Declaring (empty) static
// params lets Next cache each slug's shell after the first request instead of
// running a serverless function on every page view.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

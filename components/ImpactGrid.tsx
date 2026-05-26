import type { ImpactItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export default function ImpactGrid({
  impacts,
  offering,
}: {
  impacts: ImpactItem[];
  offering?: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {impacts.map((item) => {
        const units = offering && item.amount > 0 ? Math.floor(offering / item.amount) : 0;
        return (
          <div key={item.id} className="card p-5 text-center">
            <div className="text-3xl">{item.emoji}</div>
            <h4 className="mt-2 font-display font-bold text-ink">{item.title}</h4>
            <p className="mt-1 text-xs text-ink/60 leading-snug">{item.description}</p>
            <p className="mt-3 text-sm font-display font-bold text-amber-pressed">
              {formatCurrency(item.amount, { cents: false })}
              <span className="text-ink/50 font-medium font-sans"> / each</span>
            </p>
            {offering !== undefined && units > 0 && (
              <p className="mt-2 text-[11px] uppercase tracking-wide text-ink/50">
                Your One Day = {units} {units === 1 ? "gift" : "gifts"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

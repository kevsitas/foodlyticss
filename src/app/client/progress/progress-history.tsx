"use client";

import { useState } from "react";
import { es } from "@/lib/i18n";
import type { ClientProgress } from "@/types/database";

interface ProgressHistoryProps {
  entries: ClientProgress[];
}

export function ProgressHistory({ entries }: ProgressHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const t = es.clientProgress;
  const display = showAll ? entries : entries.slice(0, 10);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">{t.date}</th>
              <th className="pb-2 pr-4 font-medium">{t.weight}</th>
              <th className="pb-2 pr-4 font-medium">{t.bodyFat}</th>
              <th className="pb-2 pr-4 font-medium">{t.chest}</th>
              <th className="pb-2 pr-4 font-medium">{t.waist}</th>
              <th className="pb-2 pr-4 font-medium">{t.arm}</th>
              <th className="pb-2 pr-4 font-medium">{t.thigh}</th>
            </tr>
          </thead>
          <tbody>
            {display.map((entry) => (
              <tr key={entry.id} className="border-b border-border/50 text-muted-foreground">
                <td className="py-2 pr-4 font-medium text-foreground">
                  {new Date(entry.recorded_at).toLocaleDateString("es-MX")}
                </td>
                <td className="py-2 pr-4">{entry.weight ?? "--"}</td>
                <td className="py-2 pr-4">{entry.body_fat != null ? `${entry.body_fat}%` : "--"}</td>
                <td className="py-2 pr-4">{entry.chest ?? "--"}</td>
                <td className="py-2 pr-4">{entry.waist ?? "--"}</td>
                <td className="py-2 pr-4">{entry.arm ?? "--"}</td>
                <td className="py-2 pr-4">{entry.thigh ?? "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-primary hover:underline"
        >
          {showAll ? "Mostrar menos" : `Mostrar todos (${entries.length})`}
        </button>
      )}
    </div>
  );
}
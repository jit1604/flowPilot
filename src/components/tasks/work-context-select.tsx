import type { WorkContext } from "@prisma/client";

import { cn } from "@/lib/utils";

const defaultSelectClass =
  "flex h-9 w-full rounded-xl border border-input/90 bg-background/60 px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:border-primary/35 focus-visible:ring-[3px] focus-visible:ring-ring/40";

const OPTIONS: { value: WorkContext; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "quick_win", label: "Quick win (short burst)" },
  { value: "deep_work", label: "Deep work (long focus)" },
  { value: "admin", label: "Admin / ops" },
  { value: "creative", label: "Creative / open-ended" },
];

export function WorkContextSelect({
  id,
  name = "workContext",
  defaultValue = "standard",
  className,
}: {
  id: string;
  name?: string;
  defaultValue?: WorkContext;
  className?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      className={cn(defaultSelectClass, className)}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type SpecializationOption = { id: string; name: string };

export function SpecializationMultiSelect({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select specializations...",
}: {
  options: SpecializationOption[];
  value: string[];
  onChange: (nextIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value],
  );

  const label = selected.length ? selected.map((s) => s.name).join(", ") : placeholder;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between rounded-xl h-11", !selected.length && "text-muted-foreground")}
          >
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search specializations..." />
            <CommandEmpty>No specialization found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((opt) => {
                  const checked = value.includes(opt.id);
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => {
                        const next = checked
                          ? value.filter((id) => id !== opt.id)
                          : [...value, opt.id];
                        onChange(next);
                      }}
                    >
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-border">
                        {checked ? <Check className="h-4 w-4" /> : null}
                      </span>
                      <span className="flex-1">{opt.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}



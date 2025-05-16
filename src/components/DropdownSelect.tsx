"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectOption } from "@/types"; // Import SelectOption z globalnych typów

export interface DropdownSelectProps {
  options: SelectOption[];
  value?: string;
  // onChange usunięte
  paramName: "platform" | "campaign"; // Nowy prop do określenia parametru URL
  placeholder?: string;
  className?: string; // Dla <SelectContent>
  triggerClassName?: string; // Dla <SelectTrigger>
}

export function DropdownSelect({
  options,
  value: initialValue,
  paramName,
  placeholder = "Select an option",
  className,
  triggerClassName,
}: DropdownSelectProps) {
  const handleValueChange = (newValue?: string) => {
    const url = new URL(window.location.href);
    if (newValue && newValue !== "all") {
      url.searchParams.set(paramName, newValue);
    } else {
      url.searchParams.delete(paramName); // Usuń parametr, jeśli wartość to 'all' lub undefined
    }
    window.location.href = url.toString();
  };

  return (
    <Select onValueChange={handleValueChange} defaultValue={initialValue}>
      <SelectTrigger className={cn("w-full md:w-[240px]", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

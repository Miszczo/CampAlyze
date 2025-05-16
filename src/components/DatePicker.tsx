"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  date?: Date;
  paramName: "dateFrom" | "dateTo";
  className?: string;
}

export function DatePicker({ date: initialDate, paramName, className }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelectDate = (selectedDate?: Date) => {
    setDate(selectedDate);
    setIsOpen(false);

    const url = new URL(window.location.href);
    if (selectedDate) {
      url.searchParams.set(paramName, selectedDate.toISOString().split("T")[0]);
    } else {
      url.searchParams.delete(paramName);
    }
    window.location.href = url.toString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full md:w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={handleSelectDate} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

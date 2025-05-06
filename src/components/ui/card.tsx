import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function Card({ className, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardHeader({ className, asChild = false, ...props }: CardHeaderProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardTitle({ className, asChild = false, ...props }: CardTitleProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

interface CardDescriptionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardDescription({ className, asChild = false, ...props }: CardDescriptionProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

interface CardActionProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardAction({ className, asChild = false, ...props }: CardActionProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardContent({ className, asChild = false, ...props }: CardContentProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

interface CardFooterProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function CardFooter({ className, asChild = false, ...props }: CardFooterProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };

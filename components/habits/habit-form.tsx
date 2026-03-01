"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { habitFormSchema, type HabitFormValues } from "@/lib/schemas";
import { DEFAULT_COLOR, DEFAULT_DAILY_TARGET } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/habits/color-picker";

interface HabitFormProps {
  defaultValues?: Partial<HabitFormValues>;
  onSubmit: (values: HabitFormValues) => Promise<void>;
  submitLabel: string;
  isPending: boolean;
}

export function HabitForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isPending,
}: HabitFormProps) {
  const form = useForm<HabitFormValues>({
    resolver: standardSchemaResolver(habitFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      color: defaultValues?.color ?? DEFAULT_COLOR,
      daily_target: defaultValues?.daily_target ?? DEFAULT_DAILY_TARGET,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Drink water" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="daily_target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Target</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

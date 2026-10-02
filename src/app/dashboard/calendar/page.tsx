"use client";

import { useMemo, useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge, Card, Input, Label, Modal, PageHeader, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { appointments as seed, type Appointment } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, uid } from "@/lib/utils";

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const typeStyles: Record<Appointment["type"], string> = {
  consultation: "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-200",
  delivery: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-200",
  call: "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-200",
  visit: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-200",
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CalendarPage() {
  const [items, setItems] = usePersistentState<Appointment[]>("appointments", seed);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(false);
  const todayIdx = (new Date().getDay() + 6) % 7;

  const days = useMemo(() => {
    const start = startOfWeek(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  // Seed appointments are relative to today; map `day` (0 = today) onto the week grid.
  const placed = items
    .map((a) => ({ ...a, col: todayIdx + a.day - weekOffset * 7 }))
    .filter((a) => a.col >= 0 && a.col < 7);

  function add(form: FormData) {
    const date = new Date(String(form.get("date")));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = Math.round((date.getTime() - today.getTime()) / 86400000);
    setItems((all) => [
      ...all,
      {
        id: uid("a"),
        title: String(form.get("title")),
        customer: String(form.get("customer")),
        day,
        start: String(form.get("start")),
        duration: Number(form.get("duration")),
        type: form.get("type") as Appointment["type"],
        bookedBy: "team",
      },
    ]);
    setModal(false);
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Your AI books, reschedules and sends reminders automatically."
        actions={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> New appointment
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-display font-semibold">
            {days[0].toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
          </p>
          <Badge tone="brand" className="hidden sm:inline-flex">
            <Bot className="h-3 w-3" /> {items.filter((a) => a.bookedBy === "ai").length} booked by AI
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
              <div />
              {days.map((d, i) => {
                const isToday = weekOffset === 0 && i === todayIdx;
                return (
                  <div key={i} className="border-l border-border py-3 text-center">
                    <p className="text-xs text-muted-foreground">{d.toLocaleDateString("en-ZA", { weekday: "short" })}</p>
                    <p className={cn("mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full font-display font-semibold", isToday && "bg-brand text-white")}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
              <div>
                {HOURS.map((h) => (
                  <div key={h} className="h-16 pr-2 text-right text-[11px] text-muted-foreground">
                    {h}:00
                  </div>
                ))}
              </div>
              {days.map((_, col) => (
                <div key={col} className="relative border-l border-border">
                  {HOURS.map((h) => (
                    <div key={h} className="h-16 border-b border-border/60" />
                  ))}
                  {placed
                    .filter((a) => a.col === col)
                    .map((a) => {
                      const [hh, mm] = a.start.split(":").map(Number);
                      const top = ((hh - 8) * 60 + mm) * (64 / 60);
                      const height = Math.max(28, a.duration * (64 / 60) - 4);
                      return (
                        <div
                          key={a.id}
                          className={cn("absolute inset-x-1 overflow-hidden rounded-lg border-l-4 px-2 py-1 text-xs", typeStyles[a.type])}
                          style={{ top, height }}
                          title={`${a.title} — ${a.customer}`}
                        >
                          <p className="truncate font-semibold">{a.title}</p>
                          <p className="truncate opacity-80">
                            {a.start} · {a.customer}
                          </p>
                          {a.bookedBy === "ai" && height > 50 && (
                            <p className="mt-0.5 flex items-center gap-1 opacity-70">
                              <Bot className="h-3 w-3" /> AI booked
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New appointment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Consultation" />
          </div>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input id="customer" name="customer" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <Label htmlFor="start">Start</Label>
              <Input id="start" name="start" type="time" min="08:00" max="18:00" required defaultValue="10:00" />
            </div>
            <div>
              <Label htmlFor="duration">Minutes</Label>
              <Select id="duration" name="duration" defaultValue="60">
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type">
              <option value="consultation">Consultation</option>
              <option value="delivery">Delivery</option>
              <option value="call">Call</option>
              <option value="visit">Site visit</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Book appointment
          </Button>
        </form>
      </Modal>
    </>
  );
}

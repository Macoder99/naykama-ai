"use client";

import { useState } from "react";
import { Bot, Plus, Trash2 } from "lucide-react";
import { Avatar, Badge, Card, Input, Label, Modal, PageHeader, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { tasks as seed, type Task, type TaskStatus } from "@/lib/data";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn, uid } from "@/lib/utils";

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];
const priorityTone = { low: "default", medium: "blue", high: "red" } as const;
const ASSIGNEES = ["Naykama AI", "Ontiretse", "Thabo", "Naledi"];

export default function TasksPage() {
  const [items, setItems] = usePersistentState<Task[]>("tasks", seed);
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  function move(id: string, status: TaskStatus) {
    setItems((all) => all.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function add(form: FormData) {
    const assignee = String(form.get("assignee"));
    setItems((all) => [
      {
        id: uid("t"),
        title: String(form.get("title")),
        assignee,
        due: String(form.get("due") || "No date"),
        priority: form.get("priority") as Task["priority"],
        status: "todo",
        ai: assignee === "Naykama AI",
      },
      ...all,
    ]);
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Employee Tasks"
        description="Assign work to your team — or to your AI employee. Drag cards between columns."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const list = items.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => {
                if (dragId) move(dragId, col.id);
                setDragId(null);
                setOverCol(null);
              }}
              className={cn("rounded-2xl bg-muted/60 p-3 transition", overCol === col.id && "ring-2 ring-brand-2/40")}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">
                  {col.label} <span className="ml-1 text-muted-foreground">{list.length}</span>
                </p>
              </div>
              <div className="min-h-32 space-y-2">
                {list.map((t) => (
                  <Card
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    className={cn("group cursor-grab p-3.5 active:cursor-grabbing", t.status === "done" && "opacity-70")}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={t.status === "done"}
                        onChange={(e) => move(t.id, e.target.checked ? "done" : "todo")}
                        className="mt-0.5 h-4 w-4 accent-violet-600"
                        aria-label={`Mark ${t.title} done`}
                      />
                      <p className={cn("flex-1 text-sm font-medium", t.status === "done" && "line-through")}>{t.title}</p>
                      <button onClick={() => setItems((all) => all.filter((x) => x.id !== t.id))} className="hidden text-muted-foreground hover:text-red-500 group-hover:block" aria-label="Delete task">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {t.ai ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <Avatar name={t.assignee} className="h-6 w-6 text-[10px]" />
                      )}
                      <span className="text-xs text-muted-foreground">{t.assignee}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{t.due}</span>
                      <Badge tone={priorityTone[t.priority]} className="px-2 text-[10px] capitalize">
                        {t.priority}
                      </Badge>
                    </div>
                    <Select value={t.status} onChange={(e) => move(t.id, e.target.value as TaskStatus)} className="mt-3 h-8 text-xs md:hidden" aria-label="Status">
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New task">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="title">Task</Label>
            <Input id="title" name="title" required placeholder="e.g. Send follow-up to all quotes older than 3 days" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select id="assignee" name="assignee">
                {ASSIGNEES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="due">Due</Label>
              <Input id="due" name="due" placeholder="Fri" />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create task
          </Button>
        </form>
      </Modal>
    </>
  );
}

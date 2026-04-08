"use client";

import { useState } from "react";
import type { Service } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Clock, DollarSign } from "lucide-react";
import { createService, updateService, deleteService, toggleService } from "./actions";

const PRESET_COLORS = [
  "#ec4899", "#f43f5e", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
];

const PRESET_EMOJIS = [
  "✂️", "💇‍♀️", "💆‍♀️", "💅", "🧖‍♀️", "💄",
  "🪮", "🧴", "✨", "💫", "🌸", "🦋",
  "💜", "🩷", "🫧", "🧘‍♀️", "💪", "🧠",
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function ServiceForm({
  service,
  onClose,
}: {
  service?: Service;
  onClose: () => void;
}) {
  const [color, setColor] = useState(service?.color || "#6366f1");
  const [emoji, setEmoji] = useState(service?.emoji || "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("color", color);
    formData.set("emoji", emoji);
    try {
      if (service) {
        await updateService(service.id, formData);
      } else {
        await createService(formData);
      }
      onClose();
    } catch {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={service?.name}
            placeholder="Balayage Highlights"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-8 h-8 rounded text-lg flex items-center justify-center hover:bg-muted transition-colors ${
                  emoji === e ? "bg-muted ring-2 ring-primary" : ""
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={service?.description}
          placeholder="Full head of balayage highlights with toner..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={5}
            max={480}
            step={5}
            defaultValue={service?.duration_minutes || 60}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={service ? (service.price_cents / 100).toFixed(2) : ""}
            placeholder="150.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deposit">Deposit ($, optional)</Label>
          <Input
            id="deposit"
            name="deposit"
            type="number"
            min={0}
            step={0.01}
            defaultValue={
              service && service.deposit_cents > 0
                ? (service.deposit_cents / 100).toFixed(2)
                : ""
            }
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={service?.category || "general"}
            placeholder="color, cut, therapy..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending
            ? "Saving..."
            : service
            ? "Update Service"
            : "Add Service"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ServiceList({
  services,
  currency,
}: {
  services: Service[];
  currency: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  function openNew() {
    setEditingService(undefined);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">✂️</div>
            <h3 className="text-lg font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-4">
              Add the treatments and services you offer to get started
            </p>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`relative overflow-hidden ${
                !service.is_active ? "opacity-60" : ""
              }`}
            >
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: service.color }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {service.emoji && (
                      <span className="text-2xl">{service.emoji}</span>
                    )}
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.category}</CardDescription>
                    </div>
                  </div>
                  {!service.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {service.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {formatPrice(service.price_cents)}
                  </span>
                  {service.deposit_cents > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({formatPrice(service.deposit_cents)} deposit)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(service)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleService(service.id, !service.is_active)}
                  >
                    {service.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this service? This cannot be undone.")) {
                        deleteService(service.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the details for this service"
                : "Create a new service that clients can book"}
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            service={editingService}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

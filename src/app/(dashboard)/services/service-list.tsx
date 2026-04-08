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
import { Plus, Pencil, Trash2, Clock, DollarSign, Sparkles } from "lucide-react";
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
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-800 font-medium">Service Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={service?.name}
            placeholder="Balayage Highlights"
            required
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Emoji</Label>
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center hover:bg-purple-50 transition-all duration-200 ${
                  emoji === e ? "bg-purple-100 ring-2 ring-purple-400 scale-110 shadow-sm" : "hover:scale-105"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-800 font-medium">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={service?.description}
          placeholder="Full head of balayage highlights with toner..."
          rows={2}
          className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_minutes" className="text-gray-800 font-medium">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={5}
            max={480}
            step={5}
            defaultValue={service?.duration_minutes || 60}
            required
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className="text-gray-800 font-medium">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={service ? (service.price_cents / 100).toFixed(2) : ""}
            placeholder="150.00"
            required
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deposit" className="text-gray-800 font-medium">Deposit ($, optional)</Label>
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
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-800 font-medium">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={service?.category || "general"}
            placeholder="color, cut, therapy..."
            className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Color</Label>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 ${
                color === c ? "ring-2 ring-offset-2 ring-purple-400 scale-110 shadow-md" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0" disabled={pending}>
          {pending
            ? "Saving..."
            : service
            ? "Update Service"
            : "Add Service"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="border-gray-200">
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
        <Button onClick={openNew} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Time to showcase your magic</h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Add the services you offer and let clients discover what makes you amazing
            </p>
            <Button onClick={openNew} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200">
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
              className={`relative overflow-hidden rounded-2xl border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                !service.is_active ? "opacity-60" : ""
              }`}
            >
              <div
                className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl"
                style={{
                  background: `linear-gradient(to right, ${service.color}, ${service.color}88)`,
                }}
              />
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {service.emoji && (
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl shadow-sm"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        {service.emoji}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg text-gray-800">{service.name}</CardTitle>
                      <CardDescription className="text-gray-400">{service.category}</CardDescription>
                    </div>
                  </div>
                  {!service.is_active && (
                    <Badge className="rounded-full bg-gray-50 text-gray-600 border-0">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {service.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {formatPrice(service.price_cents)}
                  </span>
                  {service.deposit_cents > 0 && (
                    <span className="text-xs text-gray-400">
                      ({formatPrice(service.deposit_cents)} deposit)
                    </span>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(service)}
                    className="border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleService(service.id, !service.is_active)}
                    className="border-gray-200 hover:bg-gray-50 transition-colors"
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
                    className="hover:shadow-md transition-all"
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
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

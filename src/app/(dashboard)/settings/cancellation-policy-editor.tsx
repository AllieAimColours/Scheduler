"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Plus, Trash2, Clock, Percent, Info } from "lucide-react";
import { toast } from "sonner";
import type { Provider } from "@/types/database";
import {
  parseCancellationPolicy,
  type CancellationPolicy,
  type CancellationRule,
} from "@/lib/cancellation";

interface Props {
  provider: Provider;
  onUpdate: (provider: Provider) => void;
}

export function CancellationPolicyEditor({ provider, onUpdate }: Props) {
  const policy = parseCancellationPolicy(provider.cancellation_policy);
  const [enabled, setEnabled] = useState(policy.enabled);
  const [allowOnlineCancellation, setAllowOnlineCancellation] = useState(policy.allow_online_cancellation);
  const [rules, setRules] = useState<CancellationRule[]>(policy.rules);
  const [policyText, setPolicyText] = useState(policy.policy_text);
  const [depositThreshold, setDepositThreshold] = useState(
    policy.require_deposit_above_cents / 100
  );
  const [depositPercent, setDepositPercent] = useState(
    policy.default_deposit_percent
  );
  const [saving, setSaving] = useState(false);

  function addRule() {
    const existing = rules.map((r) => r.hours_before);
    // Pick a reasonable default that doesn't collide
    let newHours = 12;
    while (existing.includes(newHours)) {
      newHours += 1;
    }
    setRules(
      [...rules, { hours_before: newHours, refund_percent: 75 }].sort(
        (a, b) => b.hours_before - a.hours_before
      )
    );
  }

  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index));
  }

  function updateRule(
    index: number,
    field: keyof CancellationRule,
    value: number
  ) {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated.sort((a, b) => b.hours_before - a.hours_before));
  }

  async function handleSave() {
    setSaving(true);

    const newPolicy: CancellationPolicy = {
      enabled,
      allow_online_cancellation: allowOnlineCancellation,
      rules: rules.sort((a, b) => b.hours_before - a.hours_before),
      policy_text: policyText,
      require_deposit_above_cents: Math.round(depositThreshold * 100),
      default_deposit_percent: depositPercent,
    };

    const supabase = createClient();
    const policyJson = JSON.parse(JSON.stringify(newPolicy));
    const { error } = await supabase
      .from("providers")
      .update({ cancellation_policy: policyJson })
      .eq("id", provider.id);

    if (error) {
      console.error("Cancellation policy save error:", error);
      toast.error(`Failed to save: ${error.message}`);
    } else {
      toast.success("Cancellation policy saved!");
      onUpdate({
        ...provider,
        cancellation_policy: newPolicy as unknown as Provider["cancellation_policy"],
      });
    }
    setSaving(false);
  }

  return (
    <Card className="rounded-2xl border-gray-100 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-gray-800">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          Cancellation Policy
        </CardTitle>
        <CardDescription className="text-gray-400">
          Set refund rules and deposit requirements for your bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">
              Enable cancellation policy
            </p>
            <p className="text-sm text-gray-400">
              Clients will see your policy before booking
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? "bg-purple-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <>
            {/* Allow online cancellation toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  Allow online cancellation
                </p>
                <p className="text-sm text-gray-400">
                  {allowOnlineCancellation
                    ? "Clients can cancel via the link in their confirmation email"
                    : "Clients must contact you directly to cancel — no self-service cancel link"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowOnlineCancellation}
                onClick={() => setAllowOnlineCancellation(!allowOnlineCancellation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowOnlineCancellation ? "bg-purple-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowOnlineCancellation ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Refund tiers */}
            <div className="space-y-3">
              <Label className="text-gray-800 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Refund Rules
              </Label>
              <p className="text-sm text-gray-400">
                Define how much clients get back based on when they cancel
              </p>

              {/* Important explainer — what the refund percent actually applies to */}
              <div className="flex gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed space-y-1">
                  <p>
                    <span className="font-semibold">Refunds can only be processed on money collected at checkout.</span> Bloom never holds money it didn&apos;t collect.
                  </p>
                  <p className="text-gray-600">
                    <strong>Services with a deposit:</strong> Only the deposit is charged at checkout. A 100% refund rule returns the deposit — not the full service price. Example: $150 service, $20 deposit, 100% refund = client gets back $20.
                  </p>
                  <p className="text-gray-600">
                    <strong>Services with no deposit:</strong> The full price is charged at checkout, so refund percentages apply to the full price.
                  </p>
                  <p className="text-gray-600">
                    <strong>Free services ($0):</strong> Cancellation policy is not shown to clients — there&apos;s nothing to refund. Clients can still cancel, but no money changes hands.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      If cancelled
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={720}
                      value={rule.hours_before}
                      onChange={(e) =>
                        updateRule(i, "hours_before", parseInt(e.target.value) || 0)
                      }
                      className="w-20 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 text-center"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {rule.hours_before === 0 ? "or fewer" : "+"} hrs before
                    </span>
                    <span className="text-sm text-gray-400 mx-1">&rarr;</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={rule.refund_percent}
                      onChange={(e) =>
                        updateRule(
                          i,
                          "refund_percent",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 text-center"
                    />
                    <span className="text-sm text-gray-500">% refund</span>
                    <button
                      type="button"
                      onClick={() => removeRule(i)}
                      className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRule}
                className="text-sm border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add tier
              </Button>
            </div>

            {/* Custom policy text */}
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">
                Custom Policy Text (optional)
              </Label>
              <p className="text-sm text-gray-400">
                Override the auto-generated text shown to clients
              </p>
              <Textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="e.g. We understand plans change! Cancel at least 24 hours ahead for a full refund..."
                rows={3}
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>

            {/* Deposit settings */}
            <div className="space-y-4 bg-gradient-to-r from-purple-50/80 to-pink-50/50 rounded-xl p-4 border border-purple-100/60">
              <Label className="text-gray-800 font-medium flex items-center gap-2">
                <Percent className="h-4 w-4 text-purple-500" />
                Auto-Deposit Settings
              </Label>
              <p className="text-sm text-gray-500">
                Automatically require a deposit for higher-priced services. Per-service deposits always take priority.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">
                    Require deposit for services above
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={depositThreshold}
                      onChange={(e) =>
                        setDepositThreshold(parseFloat(e.target.value) || 0)
                      }
                      className="pl-7 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Set to $0 to disable auto-deposits
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">
                    Default deposit percentage
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={depositPercent}
                      onChange={(e) =>
                        setDepositPercent(parseInt(e.target.value) || 50)
                      }
                      className="pr-7 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {saving ? "Saving..." : "Save Policy"}
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { PageBlock, BlockType } from "@/lib/page-builder/types";
import { BLOCK_LIBRARY } from "@/lib/page-builder/types";
import { createDefaultBlock } from "@/lib/page-builder/defaults";
import { SortableBlock } from "./sortable-block";
import type { Provider } from "@/types/database";

interface Props {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  provider: Provider;
}

export function BlockListEditor({ blocks, onChange, provider }: Props) {
  const [showLibrary, setShowLibrary] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  function addBlock(type: BlockType) {
    const block = createDefaultBlock(type);
    onChange([...blocks, block]);
    setShowLibrary(false);
  }

  function updateBlock(id: string, config: Record<string, unknown>) {
    onChange(
      blocks.map((b) =>
        b.id === id ? ({ ...b, config: { ...b.config, ...config } } as PageBlock) : b
      )
    );
  }

  function deleteBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  function duplicateBlock(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const original = blocks[idx];
    const copy = {
      ...original,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      config: JSON.parse(JSON.stringify(original.config)),
    } as PageBlock;
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-1">
            Step 2 · Build your page
          </div>
          <h2 className="font-display text-2xl text-gray-800">Page sections</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Drag to reorder · click to edit · {blocks.length} {blocks.length === 1 ? "section" : "sections"}
          </p>
        </div>
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="bg-white border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
      </div>

      {/* Block library popover */}
      {showLibrary && (
        <div className="rounded-2xl bg-white border border-purple-100 shadow-xl p-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-gray-800">Add a section</h3>
            <button
              onClick={() => setShowLibrary(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BLOCK_LIBRARY.map((meta) => (
              <button
                key={meta.type}
                onClick={() => addBlock(meta.type)}
                className="group text-left p-4 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="font-medium text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
                  {meta.label}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">{meta.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Block list */}
      {blocks.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="font-display text-xl text-gray-400 mb-2">Your page is empty</div>
          <p className="text-sm text-gray-400 mb-4">Add your first section to get started</p>
          <button
            onClick={() => setShowLibrary(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 inline mr-1" />
            Add a section
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  provider={provider}
                  onUpdate={(config) => updateBlock(block.id, config)}
                  onDelete={() => deleteBlock(block.id)}
                  onDuplicate={() => duplicateBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

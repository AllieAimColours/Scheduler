"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  ChevronDown,
  Copy,
  Trash2,
  Settings,
  Sparkles,
  User,
  Image as ImageIcon,
  LayoutGrid,
  Quote,
  Link as LinkIcon,
  Phone,
  BookOpen,
  Columns2,
  Columns3,
  Square,
  X,
} from "lucide-react";
import type {
  PageBlock,
  PageSection,
  BlockType,
  SectionLayout,
  SectionBackground,
  SectionDivider,
  RevealAnimation,
} from "@/lib/page-builder/types";
import { columnCountFor, BLOCK_LIBRARY } from "@/lib/page-builder/types";
import {
  createDefaultBlock,
  createDefaultSection,
} from "@/lib/page-builder/defaults";
import { BlockEditor } from "./block-editor";
import type { Provider } from "@/types/database";
import { cn } from "@/lib/utils";

// ─── Icon map for blocks ───
const BLOCK_ICONS = {
  hero: Sparkles,
  about: User,
  gallery: ImageIcon,
  services: LayoutGrid,
  quote: Quote,
  link: LinkIcon,
  contact: Phone,
  digital_product: BookOpen,
};

const BLOCK_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  gallery: "Image Gallery",
  services: "Services",
  quote: "Testimonial",
  link: "Link Card",
  contact: "Contact",
  digital_product: "Digital Product",
};

interface Props {
  sections: PageSection[];
  onChange: (next: PageSection[]) => void;
  provider: Provider;
}

export function SectionListEditor({ sections, onChange, provider }: Props) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Find a block by id across all sections+columns
  function findBlockLocation(
    blockId: string
  ): { sectionIdx: number; colIdx: number; blockIdx: number } | null {
    for (let s = 0; s < sections.length; s++) {
      for (let c = 0; c < sections[s].columns.length; c++) {
        const idx = sections[s].columns[c].findIndex((b) => b.id === blockId);
        if (idx >= 0) return { sectionIdx: s, colIdx: c, blockIdx: idx };
      }
    }
    return null;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveBlockId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveBlockId(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromLoc = findBlockLocation(activeId);
    if (!fromLoc) return;

    // Drop targets can be:
    // 1) another block id → place before/after it
    // 2) a column slot id "col:sectionIdx:colIdx" → drop into the column
    let toSectionIdx: number;
    let toColIdx: number;
    let toBlockIdx: number;

    if (overId.startsWith("col:")) {
      const [, s, c] = overId.split(":");
      toSectionIdx = Number(s);
      toColIdx = Number(c);
      toBlockIdx = sections[toSectionIdx].columns[toColIdx].length;
    } else {
      const toLoc = findBlockLocation(overId);
      if (!toLoc) return;
      toSectionIdx = toLoc.sectionIdx;
      toColIdx = toLoc.colIdx;
      toBlockIdx = toLoc.blockIdx;
    }

    // Move the block
    const next = sections.map((s) => ({
      ...s,
      columns: s.columns.map((col) => [...col]),
    }));
    const [moved] = next[fromLoc.sectionIdx].columns[fromLoc.colIdx].splice(
      fromLoc.blockIdx,
      1
    );
    // If we removed from before our drop target in the same column, fix the index
    if (
      fromLoc.sectionIdx === toSectionIdx &&
      fromLoc.colIdx === toColIdx &&
      fromLoc.blockIdx < toBlockIdx
    ) {
      toBlockIdx--;
    }
    next[toSectionIdx].columns[toColIdx].splice(toBlockIdx, 0, moved);
    onChange(next);
  }

  // ─── Section operations ───
  function addSection(layout: SectionLayout) {
    onChange([...sections, createDefaultSection(layout)]);
    setShowAddSectionMenu(false);
  }

  function deleteSection(sectionIdx: number) {
    onChange(sections.filter((_, i) => i !== sectionIdx));
  }

  function updateSection(sectionIdx: number, patch: Partial<PageSection>) {
    const next = sections.map((s, i) => (i === sectionIdx ? { ...s, ...patch } : s));
    onChange(next);
  }

  function changeSectionLayout(sectionIdx: number, layout: SectionLayout) {
    const newColCount = columnCountFor(layout);
    const oldCols = sections[sectionIdx].columns;
    const newCols: PageBlock[][] = Array.from({ length: newColCount }, (_, i) => oldCols[i] || []);
    // If we're shrinking, push extra blocks into the last remaining column
    if (oldCols.length > newColCount) {
      for (let i = newColCount; i < oldCols.length; i++) {
        newCols[newColCount - 1].push(...oldCols[i]);
      }
    }
    updateSection(sectionIdx, { layout, columns: newCols });
  }

  function moveSection(sectionIdx: number, direction: -1 | 1) {
    const newIdx = sectionIdx + direction;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const next = [...sections];
    [next[sectionIdx], next[newIdx]] = [next[newIdx], next[sectionIdx]];
    onChange(next);
  }

  // ─── Block operations ───
  function addBlock(sectionIdx: number, colIdx: number, type: BlockType) {
    const block = createDefaultBlock(type);
    const next = sections.map((s, i) => {
      if (i !== sectionIdx) return s;
      const cols = s.columns.map((col, ci) => (ci === colIdx ? [...col, block] : col));
      return { ...s, columns: cols };
    });
    onChange(next);
  }

  function updateBlock(blockId: string, config: Record<string, unknown>) {
    const loc = findBlockLocation(blockId);
    if (!loc) return;
    const next = sections.map((s, si) => {
      if (si !== loc.sectionIdx) return s;
      return {
        ...s,
        columns: s.columns.map((col, ci) => {
          if (ci !== loc.colIdx) return col;
          return col.map((b) =>
            b.id === blockId ? ({ ...b, config: { ...b.config, ...config } } as PageBlock) : b
          );
        }),
      };
    });
    onChange(next);
  }

  function deleteBlock(blockId: string) {
    const loc = findBlockLocation(blockId);
    if (!loc) return;
    const next = sections.map((s, si) => {
      if (si !== loc.sectionIdx) return s;
      return {
        ...s,
        columns: s.columns.map((col, ci) =>
          ci === loc.colIdx ? col.filter((b) => b.id !== blockId) : col
        ),
      };
    });
    onChange(next);
  }

  function duplicateBlock(blockId: string) {
    const loc = findBlockLocation(blockId);
    if (!loc) return;
    const original = sections[loc.sectionIdx].columns[loc.colIdx][loc.blockIdx];
    const copy: PageBlock = {
      ...original,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      config: JSON.parse(JSON.stringify(original.config)),
    };
    const next = sections.map((s, si) => {
      if (si !== loc.sectionIdx) return s;
      return {
        ...s,
        columns: s.columns.map((col, ci) => {
          if (ci !== loc.colIdx) return col;
          const c = [...col];
          c.splice(loc.blockIdx + 1, 0, copy);
          return c;
        }),
      };
    });
    onChange(next);
  }

  // Get the active block for the drag overlay
  const activeBlock = activeBlockId
    ? (() => {
        const loc = findBlockLocation(activeBlockId);
        return loc ? sections[loc.sectionIdx].columns[loc.colIdx][loc.blockIdx] : null;
      })()
    : null;

  // All block ids in render order — used by SortableContext
  const allBlockIds: string[] = sections.flatMap((s) =>
    s.columns.flatMap((col) => col.map((b) => b.id))
  );

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allBlockIds} strategy={verticalListSortingStrategy}>
          {sections.map((section, sectionIdx) => (
            <SectionCard
              key={section.id}
              section={section}
              sectionIdx={sectionIdx}
              isFirst={sectionIdx === 0}
              isLast={sectionIdx === sections.length - 1}
              provider={provider}
              onChangeLayout={(l) => changeSectionLayout(sectionIdx, l)}
              onUpdateSection={(p) => updateSection(sectionIdx, p)}
              onDelete={() => deleteSection(sectionIdx)}
              onMoveUp={() => moveSection(sectionIdx, -1)}
              onMoveDown={() => moveSection(sectionIdx, 1)}
              onAddBlock={(colIdx, type) => addBlock(sectionIdx, colIdx, type)}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onDuplicateBlock={duplicateBlock}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeBlock && <BlockGhost block={activeBlock} />}
        </DragOverlay>
      </DndContext>

      {/* Add section button */}
      <div className="relative">
        <button
          onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
          className="w-full py-5 rounded-2xl border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add a section
        </button>

        {showAddSectionMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-purple-100 shadow-xl p-4 z-30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base text-gray-800">Choose a layout</h3>
              <button
                onClick={() => setShowAddSectionMenu(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "single", label: "Full width", icon: Square },
                  { id: "two-col", label: "Two columns", icon: Columns2 },
                  { id: "three-col", label: "Three columns", icon: Columns3 },
                  { id: "asymmetric", label: "60 / 40 split", icon: Columns2 },
                  { id: "two-col-60-40", label: "Wide left", icon: Columns2 },
                  { id: "two-col-40-60", label: "Wide right", icon: Columns2 },
                ] as Array<{ id: SectionLayout; label: string; icon: typeof Square }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => addSection(opt.id)}
                  className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer text-left"
                >
                  <opt.icon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Section card — wraps columns of blocks
// ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  sectionIdx,
  isFirst,
  isLast,
  provider,
  onChangeLayout,
  onUpdateSection,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: {
  section: PageSection;
  sectionIdx: number;
  isFirst: boolean;
  isLast: boolean;
  provider: Provider;
  onChangeLayout: (layout: SectionLayout) => void;
  onUpdateSection: (patch: Partial<PageSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddBlock: (colIdx: number, type: BlockType) => void;
  onUpdateBlock: (blockId: string, config: Record<string, unknown>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const layoutLabel: Record<SectionLayout, string> = {
    "single": "Full width",
    "two-col": "Two columns",
    "two-col-60-40": "Wide left",
    "two-col-40-60": "Wide right",
    "three-col": "Three columns",
    "asymmetric": "60 / 40",
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/40 rounded-t-3xl">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Section {sectionIdx + 1}
        </div>
        <div className="text-xs text-gray-500 font-medium">· {layoutLabel[section.layout]}</div>
        <div className="flex-1" />
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Move section up"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Move section down"
        >
          ▼
        </button>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn(
            "p-1.5 rounded-lg transition-colors cursor-pointer",
            settingsOpen
              ? "bg-purple-100 text-purple-700"
              : "text-gray-300 hover:text-purple-600 hover:bg-purple-50"
          )}
          aria-label="Section settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="border-b border-gray-100 p-4 bg-purple-50/30 animate-in slide-in-from-top-2 duration-200">
          <SectionSettings
            section={section}
            onChangeLayout={onChangeLayout}
            onUpdateSection={onUpdateSection}
          />
        </div>
      )}

      {/* Columns */}
      <div className={cn("p-4 grid gap-3", layoutToEditorGrid(section.layout))}>
        {section.columns.map((col, colIdx) => (
          <ColumnDropZone
            key={colIdx}
            sectionIdx={sectionIdx}
            colIdx={colIdx}
            blocks={col}
            provider={provider}
            onAddBlock={(type) => onAddBlock(colIdx, type)}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onDuplicateBlock={onDuplicateBlock}
          />
        ))}
      </div>
    </div>
  );
}

function layoutToEditorGrid(layout: SectionLayout): string {
  switch (layout) {
    case "single":
      return "grid-cols-1";
    case "two-col":
      return "md:grid-cols-2";
    case "two-col-60-40":
      return "md:grid-cols-[3fr_2fr]";
    case "two-col-40-60":
      return "md:grid-cols-[2fr_3fr]";
    case "three-col":
      return "md:grid-cols-3";
    case "asymmetric":
      return "md:grid-cols-[3fr_2fr]";
  }
}

// ─────────────────────────────────────────────────────────────
//  Column drop zone
// ─────────────────────────────────────────────────────────────

function ColumnDropZone({
  sectionIdx,
  colIdx,
  blocks,
  provider,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: {
  sectionIdx: number;
  colIdx: number;
  blocks: PageBlock[];
  provider: Provider;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, config: Record<string, unknown>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const dropId = `col:${sectionIdx}:${colIdx}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all min-h-[100px] p-2 space-y-2",
        isOver
          ? "border-purple-400 bg-purple-50/60"
          : "border-gray-200 hover:border-purple-300"
      )}
    >
      {blocks.length === 0 ? (
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="w-full h-full min-h-[80px] flex flex-col items-center justify-center text-gray-400 hover:text-purple-600 transition-colors cursor-pointer p-4"
        >
          <Plus className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Add a block here</span>
        </button>
      ) : (
        blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            provider={provider}
            onUpdate={(c) => onUpdateBlock(block.id, c)}
            onDelete={() => onDeleteBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
          />
        ))
      )}

      {blocks.length > 0 && (
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="w-full py-2 text-xs text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add another block
        </button>
      )}

      {/* Block library popup — absolute so it floats over the layout
          instead of pushing the column taller (which was causing overlap
          with the "Add a section" button below). */}
      {showLibrary && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            onClick={() => setShowLibrary(false)}
            className="fixed inset-0 z-40"
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl bg-white border border-purple-200 shadow-xl p-3 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_LIBRARY.map((meta) => {
                const Icon = BLOCK_ICONS[meta.type] || Sparkles;
                return (
                  <button
                    key={meta.type}
                    onClick={() => {
                      onAddBlock(meta.type);
                      setShowLibrary(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 text-left transition-colors cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Block card (sortable)
// ─────────────────────────────────────────────────────────────

function BlockCard({
  block,
  provider,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  block: PageBlock;
  provider: Provider;
  onUpdate: (config: Record<string, unknown>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = BLOCK_ICONS[block.type] || Sparkles;
  const label = BLOCK_LABELS[block.type] || block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border bg-white transition-all",
        isDragging ? "border-purple-400 shadow-2xl scale-[1.02] z-10 opacity-50" : "border-gray-100 hover:border-purple-200"
      )}
    >
      <div className="flex items-center gap-2 p-2.5">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-0.5"
          aria-label="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="inline-flex p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
          <Icon className="h-3.5 w-3.5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">{label}</div>
        </div>
        <button
          onClick={onDuplicate}
          className="p-1.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
          aria-label="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "p-1.5 rounded-lg transition-all cursor-pointer",
            open
              ? "bg-purple-100 text-purple-700 rotate-180"
              : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
          )}
          aria-label="Toggle editor"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 animate-in slide-in-from-top-1 duration-200">
          <BlockEditor block={block} provider={provider} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ─── Drag overlay ghost ───
function BlockGhost({ block }: { block: PageBlock }) {
  const Icon = BLOCK_ICONS[block.type] || Sparkles;
  const label = BLOCK_LABELS[block.type] || block.type;
  return (
    <div className="rounded-xl bg-white border-2 border-purple-400 shadow-2xl p-2.5 flex items-center gap-2 max-w-xs">
      <div className="inline-flex p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
        <Icon className="h-3.5 w-3.5 text-purple-600" />
      </div>
      <div className="text-sm font-semibold text-gray-800">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Section settings (layout, background, divider, reveal)
// ─────────────────────────────────────────────────────────────

function SectionSettings({
  section,
  onChangeLayout,
  onUpdateSection,
}: {
  section: PageSection;
  onChangeLayout: (layout: SectionLayout) => void;
  onUpdateSection: (patch: Partial<PageSection>) => void;
}) {
  const layoutOptions: Array<{ id: SectionLayout; label: string }> = [
    { id: "single", label: "Full" },
    { id: "two-col", label: "2 col" },
    { id: "two-col-60-40", label: "60/40" },
    { id: "two-col-40-60", label: "40/60" },
    { id: "three-col", label: "3 col" },
    { id: "asymmetric", label: "Hero+side" },
  ];

  const dividerOptions: Array<{ id: SectionDivider; label: string }> = [
    { id: "none", label: "None" },
    { id: "wave", label: "Wave" },
    { id: "wave-soft", label: "Soft wave" },
    { id: "zigzag", label: "Zigzag" },
    { id: "blob", label: "Blob" },
    { id: "dots", label: "Dots" },
    { id: "fade", label: "Fade" },
  ];

  const revealOptions: Array<{ id: RevealAnimation; label: string }> = [
    { id: "none", label: "None" },
    { id: "fade", label: "Fade" },
    { id: "slide-up", label: "Slide up" },
    { id: "slide-left", label: "Slide left" },
    { id: "slide-right", label: "Slide right" },
    { id: "zoom", label: "Zoom" },
  ];

  const bgType = section.background?.type || "none";
  const bgTypeOptions: Array<{ id: SectionBackground["type"]; label: string }> = [
    { id: "none", label: "None" },
    { id: "solid", label: "Solid" },
    { id: "gradient", label: "Gradient" },
    { id: "mesh", label: "Mesh" },
    { id: "image", label: "Image" },
  ];

  function setBackground(type: SectionBackground["type"]) {
    if (type === "none") {
      onUpdateSection({ background: { type: "none" } });
    } else if (type === "solid") {
      onUpdateSection({ background: { type: "solid", color: "#f5f0ff" } });
    } else if (type === "gradient") {
      onUpdateSection({
        background: { type: "gradient", from: "#a855f7", to: "#ec4899", angle: 135 },
      });
    } else if (type === "mesh") {
      onUpdateSection({
        background: { type: "mesh", colors: ["#a855f7", "#ec4899", "#f59e0b"] },
      });
    } else if (type === "image") {
      onUpdateSection({ background: { type: "image", url: "", parallax: false, overlay: 0 } });
    }
  }

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Layout</div>
        <div className="flex flex-wrap gap-1.5">
          {layoutOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChangeLayout(opt.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer",
                section.layout === opt.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background type */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Background</div>
        <div className="flex flex-wrap gap-1.5">
          {bgTypeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBackground(opt.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer",
                bgType === opt.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Background config */}
        {section.background?.type === "solid" && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={section.background.color}
              onChange={(e) =>
                onUpdateSection({ background: { type: "solid", color: e.target.value } })
              }
              className="h-9 w-12 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={section.background.color}
              onChange={(e) =>
                onUpdateSection({ background: { type: "solid", color: e.target.value } })
              }
              className="flex-1 px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-mono"
            />
          </div>
        )}

        {section.background?.type === "gradient" && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-gray-500 mb-1">From</div>
              <input
                type="color"
                value={section.background.from}
                onChange={(e) =>
                  onUpdateSection({
                    background: {
                      type: "gradient",
                      from: e.target.value,
                      to: (section.background as { to: string }).to,
                      angle: (section.background as { angle?: number }).angle,
                    },
                  })
                }
                className="h-9 w-full rounded-lg border-2 border-gray-200 cursor-pointer"
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-1">To</div>
              <input
                type="color"
                value={section.background.to}
                onChange={(e) =>
                  onUpdateSection({
                    background: {
                      type: "gradient",
                      from: (section.background as { from: string }).from,
                      to: e.target.value,
                      angle: (section.background as { angle?: number }).angle,
                    },
                  })
                }
                className="h-9 w-full rounded-lg border-2 border-gray-200 cursor-pointer"
              />
            </div>
          </div>
        )}

        {section.background?.type === "image" && (
          <div className="mt-2 space-y-2">
            <ImageUpload
              value={section.background.url}
              onChange={(v) =>
                onUpdateSection({
                  background: {
                    type: "image",
                    url: v,
                    parallax: (section.background as { parallax?: boolean }).parallax,
                    overlay: (section.background as { overlay?: number }).overlay,
                  },
                })
              }
              folder="sections"
            />
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={(section.background as { parallax?: boolean }).parallax || false}
                onChange={(e) =>
                  onUpdateSection({
                    background: {
                      type: "image",
                      url: (section.background as { url: string }).url,
                      parallax: e.target.checked,
                      overlay: (section.background as { overlay?: number }).overlay,
                    },
                  })
                }
                className="rounded"
              />
              Parallax effect
            </label>
          </div>
        )}
      </div>

      {/* Divider */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Bottom divider</div>
        <div className="flex flex-wrap gap-1.5">
          {dividerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onUpdateSection({ divider: opt.id })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer",
                (section.divider || "none") === opt.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reveal animation */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Scroll reveal</div>
        <div className="flex flex-wrap gap-1.5">
          {revealOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onUpdateSection({ reveal: opt.id })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer",
                (section.reveal || "none") === opt.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

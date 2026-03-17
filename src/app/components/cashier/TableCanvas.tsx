import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Move, RotateCw, Plus, Minus, Save, Grid3X3, Users,
  Square, Circle, RectangleHorizontal, Trash2, ZoomIn, ZoomOut,
  Lock, Unlock, ArrowLeft, MousePointer, Pencil, Eraser,
  Droplets, CreditCard, Package, Armchair, Undo, Redo,
  DoorOpen, Fence, Copy, Type, Monitor, Store, Sofa,
  Maximize, Hand,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

/* ===================== Types ===================== */
type ElementKind = 'table' | 'wall' | 'billing' | 'parcel' | 'handwash' | 'entrance' | 'kitchen' | 'display' | 'stall' | 'lounge' | 'label';

interface FloorElement {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  locked: boolean;
  tableId?: number;
  seats?: number;
  shape?: 'square' | 'circle' | 'rect';
  status?: string;
  wallThickness?: number;
  text?: string;
}

type ToolMode = 'select' | 'addTable' | 'addWall' | 'addFixture' | 'erase';
type FixtureType = 'billing' | 'parcel' | 'handwash' | 'entrance' | 'kitchen' | 'display' | 'stall' | 'lounge';

interface TableCanvasProps {
  tables: { id: number; seats: number; status: string }[];
  selectedTable: number | null;
  onSelectTable: (id: number) => void;
  onClose: () => void;
}

/* ===================== Constants ===================== */
const GRID = 20;
const STORAGE_KEY = 'nnk_floor_plan';
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

const STATUS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  available: { fill: '#dcfce7', stroke: '#86efac', text: '#15803d' },
  occupied:  { fill: '#dbeafe', stroke: '#93c5fd', text: '#1d4ed8' },
  reserved:  { fill: '#fef3c7', stroke: '#fcd34d', text: '#a16207' },
  held:      { fill: '#fed7aa', stroke: '#fdba74', text: '#c2410c' },
};

const FIXTURE_CONFIG: Record<FixtureType, { label: string; icon: typeof CreditCard; color: string; bg: string; border: string; defaultW: number; defaultH: number }> = {
  billing:  { label: 'Billing',   icon: CreditCard, color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', defaultW: 140, defaultH: 80 },
  parcel:   { label: 'Parcel',    icon: Package,    color: '#ea580c', bg: '#fff7ed', border: '#fdba74', defaultW: 120, defaultH: 80 },
  handwash: { label: 'Hand Wash', icon: Droplets,   color: '#0891b2', bg: '#ecfeff', border: '#67e8f9', defaultW: 80,  defaultH: 60 },
  entrance: { label: 'Entrance',  icon: DoorOpen,   color: '#16a34a', bg: '#f0fdf4', border: '#86efac', defaultW: 100, defaultH: 40 },
  kitchen:  { label: 'Kitchen',   icon: Fence,      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', defaultW: 160, defaultH: 100 },
  display:  { label: 'Display',   icon: Monitor,    color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', defaultW: 120, defaultH: 60 },
  stall:    { label: 'Stall',     icon: Store,      color: '#b45309', bg: '#fffbeb', border: '#fcd34d', defaultW: 140, defaultH: 90 },
  lounge:   { label: 'Lounge',    icon: Sofa,       color: '#9333ea', bg: '#faf5ff', border: '#d8b4fe', defaultW: 160, defaultH: 100 },
};

const snap = (v: number) => Math.round(v / GRID) * GRID;
function generateId() { return `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

/* ===================== Helpers ===================== */
function buildInitialElements(tables: TableCanvasProps['tables']): FloorElement[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: FloorElement[] = JSON.parse(saved);
      const statusMap = new Map(tables.map(t => [t.id, t.status]));
      return parsed.map(el => (el.kind === 'table' && el.tableId != null)
        ? { ...el, status: statusMap.get(el.tableId) || el.status }
        : el
      );
    }
  } catch { /* ignore */ }

  const els: FloorElement[] = [];
  els.push({ id: generateId(), kind: 'wall', x: 0, y: 0, w: 900, h: 12, rotation: 0, locked: true, wallThickness: 12 });
  els.push({ id: generateId(), kind: 'wall', x: 0, y: 0, w: 12, h: 600, rotation: 0, locked: true, wallThickness: 12 });
  els.push({ id: generateId(), kind: 'wall', x: 888, y: 0, w: 12, h: 600, rotation: 0, locked: true, wallThickness: 12 });
  els.push({ id: generateId(), kind: 'wall', x: 0, y: 588, w: 900, h: 12, rotation: 0, locked: true, wallThickness: 12 });
  els.push({ id: generateId(), kind: 'entrance', x: 380, y: 588, w: 100, h: 40, rotation: 0, locked: false });
  els.push({ id: generateId(), kind: 'kitchen', x: 700, y: 20, w: 180, h: 120, rotation: 0, locked: false });
  els.push({ id: generateId(), kind: 'billing', x: 40, y: 480, w: 140, h: 80, rotation: 0, locked: false });
  els.push({ id: generateId(), kind: 'parcel', x: 220, y: 480, w: 120, h: 80, rotation: 0, locked: false });
  els.push({ id: generateId(), kind: 'handwash', x: 800, y: 480, w: 80, h: 60, rotation: 0, locked: false });

  tables.forEach((t, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const shape: FloorElement['shape'] = t.seats <= 2 ? 'circle' : t.seats <= 4 ? 'square' : 'rect';
    const w = shape === 'rect' ? 120 : shape === 'square' ? 80 : 70;
    const h = shape === 'rect' ? 70 : shape === 'square' ? 80 : 70;
    els.push({
      id: generateId(), kind: 'table',
      x: 80 + col * 160, y: 60 + row * 140, w, h,
      rotation: 0, locked: false,
      tableId: t.id, seats: t.seats, shape, status: t.status,
    });
  });
  return els;
}

/* ===================== Component ===================== */
export function TableCanvas({ tables, selectedTable, onSelectTable, onClose }: TableCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FloorElement[]>(() => buildInitialElements(tables));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolMode>('select');
  const [fixtureType, setFixtureType] = useState<FixtureType>('billing');
  const [editMode, setEditMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // ── Infinite canvas: pan + zoom ──
  const [panX, setPanX] = useState(60);
  const [panY, setPanY] = useState(30);
  const [zoom, setZoom] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── Element dragging ──
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // ── Wall drawing ──
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [wallPreview, setWallPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── History ──
  const [history, setHistory] = useState<FloorElement[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const nextTableId = useRef(Math.max(...tables.map(t => t.id), 0) + 1);
  const selected = elements.find(e => e.id === selectedId) || null;

  /* ── History helpers ── */
  const pushHistory = useCallback((newEls: FloorElement[]) => {
    setHistory(prev => [...prev.slice(0, historyIdx + 1), newEls].slice(-30));
    setHistoryIdx(prev => Math.min(prev + 1, 29));
  }, [historyIdx]);

  const updateElements = useCallback((updater: (prev: FloorElement[]) => FloorElement[]) => {
    setElements(prev => { const next = updater(prev); pushHistory(next); return next; });
  }, [pushHistory]);

  const undo = () => { if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setElements(history[historyIdx - 1]); } };
  const redo = () => { if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setElements(history[historyIdx + 1]); } };

  const saveLayout = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(elements)); toast.success('Floor plan saved!'); };

  /* ── Screen → world coords ── */
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: snap((clientX - rect.left - panX) / zoom),
      y: snap((clientY - rect.top - panY) / zoom),
    };
  }, [panX, panY, zoom]);

  /* ── Fit to view ── */
  const fitToView = useCallback(() => {
    if (!elements.length || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.w);
      maxY = Math.max(maxY, el.y + el.h);
    });
    const contentW = maxX - minX + 80;
    const contentH = maxY - minY + 80;
    const newZoom = Math.min(Math.max(Math.min(rect.width / contentW, rect.height / contentH), MIN_ZOOM), MAX_ZOOM);
    setPanX((rect.width - contentW * newZoom) / 2 - minX * newZoom + 40 * newZoom);
    setPanY((rect.height - contentH * newZoom) / 2 - minY * newZoom + 40 * newZoom);
    setZoom(+newZoom.toFixed(2));
  }, [elements]);

  /* ── Keyboard: space to pan ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { setSpaceHeld(false); setIsPanning(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  /* ── Wheel: pinch-zoom or scroll-pan ── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        // Pinch / Ctrl+scroll → zoom toward cursor
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - panX) / zoom;
        const worldY = (mouseY - panY) / zoom;
        const delta = -e.deltaY * 0.003;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (1 + delta)));
        setPanX(mouseX - worldX * newZoom);
        setPanY(mouseY - worldY * newZoom);
        setZoom(+newZoom.toFixed(3));
      } else {
        // Plain scroll → pan
        setPanX(prev => prev - e.deltaX);
        setPanY(prev => prev - e.deltaY);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, panX, panY]);

  /* ── Canvas mouse handlers ── */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle-click or space+click → start panning
    if (e.button === 1 || spaceHeld) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      e.preventDefault();
      return;
    }

    // Only left-click below
    if (e.button !== 0) return;

    // If clicking canvas background (not on an element)
    const isBackground = e.target === e.currentTarget || (e.target as HTMLElement).dataset?.canvasbg === 'true';

    const world = screenToWorld(e.clientX, e.clientY);

    if (tool === 'addWall' && editMode && isBackground) {
      setWallStart(world);
      setWallPreview({ x: world.x, y: world.y, w: GRID, h: 12 });
      e.preventDefault();
      return;
    }

    if (tool === 'addTable' && editMode && isBackground) {
      const id = nextTableId.current++;
      const newTable: FloorElement = {
        id: generateId(), kind: 'table', x: world.x, y: world.y, w: 80, h: 80,
        rotation: 0, locked: false, tableId: id, seats: 4, shape: 'square', status: 'available',
      };
      updateElements(prev => [...prev, newTable]);
      setSelectedId(newTable.id);
      toast.success(`Table T${id} added`);
      return;
    }

    if (tool === 'addFixture' && editMode && isBackground) {
      const cfg = FIXTURE_CONFIG[fixtureType];
      const newFixture: FloorElement = {
        id: generateId(), kind: fixtureType, x: world.x, y: world.y,
        w: cfg.defaultW, h: cfg.defaultH, rotation: 0, locked: false,
      };
      updateElements(prev => [...prev, newFixture]);
      setSelectedId(newFixture.id);
      toast.success(`${cfg.label} area added`);
      return;
    }

    if (tool === 'select' && isBackground) {
      setSelectedId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      setPanX(panStart.current.panX + (e.clientX - panStart.current.x));
      setPanY(panStart.current.panY + (e.clientY - panStart.current.y));
      return;
    }

    // Wall drawing preview
    if (tool === 'addWall' && wallStart) {
      const world = screenToWorld(e.clientX, e.clientY);
      const dx = world.x - wallStart.x;
      const dy = world.y - wallStart.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        setWallPreview({ x: dx >= 0 ? wallStart.x : world.x, y: wallStart.y, w: Math.max(GRID, Math.abs(dx)), h: 12 });
      } else {
        setWallPreview({ x: wallStart.x, y: dy >= 0 ? wallStart.y : world.y, w: 12, h: Math.max(GRID, Math.abs(dy)) });
      }
      return;
    }

    // Dragging element
    if (dragging && editMode) {
      const world = screenToWorld(e.clientX, e.clientY);
      const newX = snap(world.x - dragOffset.x);
      const newY = snap(world.y - dragOffset.y);
      setElements(prev => prev.map(el => el.id === dragging ? { ...el, x: newX, y: newY } : el));
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) { setIsPanning(false); return; }

    if (tool === 'addWall' && wallStart && wallPreview) {
      if (wallPreview.w >= GRID || wallPreview.h >= GRID) {
        const newWall: FloorElement = {
          id: generateId(), kind: 'wall',
          x: wallPreview.x, y: wallPreview.y, w: wallPreview.w, h: wallPreview.h,
          rotation: 0, locked: false, wallThickness: Math.min(wallPreview.w, wallPreview.h),
        };
        updateElements(prev => [...prev, newWall]);
        toast.success('Wall segment added');
      }
      setWallStart(null);
      setWallPreview(null);
      return;
    }

    if (dragging) { pushHistory(elements); setDragging(null); }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: FloorElement) => {
    e.stopPropagation();

    // Panning has priority
    if (e.button === 1 || spaceHeld) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      e.preventDefault();
      return;
    }

    if (tool === 'erase' && editMode) {
      if (!el.locked) {
        updateElements(prev => prev.filter(x => x.id !== el.id));
        if (el.kind === 'table') toast.info(`Table T${el.tableId} removed`);
        else toast.info(`${el.kind} removed`);
      }
      return;
    }

    setSelectedId(el.id);

    if (!editMode) {
      if (el.kind === 'table' && el.tableId != null) onSelectTable(el.tableId);
      return;
    }

    if (el.locked) return;

    // Start element drag
    const world = screenToWorld(e.clientX, e.clientY);
    setDragging(el.id);
    setDragOffset({ x: world.x - el.x, y: world.y - el.y });
    e.preventDefault();
  };

  /* ── Element mutation helpers ── */
  const addChair = (id: string) => updateElements(p => p.map(el => el.id === id && el.kind === 'table' ? { ...el, seats: Math.min((el.seats || 2) + 1, 8) } : el));
  const removeChair = (id: string) => updateElements(p => p.map(el => el.id === id && el.kind === 'table' ? { ...el, seats: Math.max((el.seats || 2) - 1, 1) } : el));
  const rotateElement = (id: string) => updateElements(p => p.map(el => el.id === id ? { ...el, rotation: (el.rotation + 45) % 360 } : el));
  const toggleLock = (id: string) => updateElements(p => p.map(el => el.id === id ? { ...el, locked: !el.locked } : el));
  const deleteElement = (id: string) => { const el = elements.find(x => x.id === id); if (el?.locked) return; updateElements(p => p.filter(x => x.id !== id)); setSelectedId(null); if (el?.kind === 'table') toast.info(`Table T${el.tableId} removed`); };

  const changeTableShape = (id: string) => {
    const shapes: FloorElement['shape'][] = ['square', 'circle', 'rect'];
    updateElements(p => p.map(el => {
      if (el.id !== id || el.kind !== 'table') return el;
      const ns = shapes[(shapes.indexOf(el.shape!) + 1) % 3];
      return { ...el, shape: ns, w: ns === 'rect' ? 120 : ns === 'square' ? 80 : 70, h: ns === 'rect' ? 70 : ns === 'square' ? 80 : 70 };
    }));
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(x => x.id === id);
    if (!el) return;
    const n: FloorElement = { ...el, id: generateId(), x: el.x + 40, y: el.y + 40, locked: false, ...(el.kind === 'table' ? { tableId: nextTableId.current++ } : {}) };
    updateElements(p => [...p, n]);
    setSelectedId(n.id);
    toast.success(el.kind === 'table' ? `Table T${n.tableId} duplicated` : `${el.kind} duplicated`);
  };

  const resizeElement = (id: string, dw: number, dh: number) => updateElements(p => p.map(el => el.id === id ? { ...el, w: Math.max(GRID * 2, el.w + dw), h: Math.max(GRID * 2, el.h + dh) } : el));

  /* ── Render seats ── */
  const renderSeats = (el: FloorElement) => {
    if (el.kind !== 'table' || !el.seats) return null;
    const seatR = 7, pad = 13;
    const positions: { x: number; y: number }[] = [];
    const { w, h, seats } = el;
    if (seats <= 2) { positions.push({ x: -pad, y: h / 2 }, { x: w + pad, y: h / 2 }); }
    else if (seats <= 4) { positions.push({ x: w / 2, y: -pad }, { x: w + pad, y: h / 2 }, { x: w / 2, y: h + pad }, { x: -pad, y: h / 2 }); }
    else { positions.push({ x: w * 0.25, y: -pad }, { x: w * 0.75, y: -pad }, { x: w + pad, y: h * 0.33 }, { x: w + pad, y: h * 0.67 }, { x: w * 0.75, y: h + pad }, { x: w * 0.25, y: h + pad }, { x: -pad, y: h * 0.67 }, { x: -pad, y: h * 0.33 }); }
    const occ = el.status === 'occupied';
    return positions.slice(0, seats).map((pos, i) => (
      <div key={i} className="absolute rounded-full border-2 transition-colors"
        style={{ width: seatR * 2, height: seatR * 2, left: pos.x - seatR, top: pos.y - seatR,
          backgroundColor: occ ? '#93c5fd' : '#f1f5f9', borderColor: occ ? '#3b82f6' : '#cbd5e1' }} />
    ));
  };

  /* ── Render fixture ── */
  const renderFixture = (el: FloorElement) => {
    const cfg = FIXTURE_CONFIG[el.kind as FixtureType];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
      <div className="w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 select-none"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        <span className="text-[0.6rem] tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    );
  };

  /* ── ToolBtn ── */
  const ToolBtn = ({ active, onClick, children, title, disabled }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`p-2 rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-primary text-white shadow-sm' : 'bg-white hover:bg-muted text-muted-foreground border border-border'}`}>
      {children}
    </button>
  );

  const tableCount = elements.filter(e => e.kind === 'table').length;
  const wallCount = elements.filter(e => e.kind === 'wall').length;

  // Determine cursor
  const getCursorClass = () => {
    if (isPanning || spaceHeld) return 'cursor-grabbing';
    if (tool === 'addWall') return 'cursor-crosshair';
    if (tool === 'addTable' || tool === 'addFixture') return 'cursor-cell';
    if (tool === 'erase') return 'cursor-not-allowed';
    return 'cursor-default';
  };

  // Grid background that moves with pan
  const gridBgStyle = showGrid ? {
    backgroundImage: `radial-gradient(circle, #d1d5db 0.8px, transparent 0.8px)`,
    backgroundSize: `${GRID * zoom}px ${GRID * zoom}px`,
    backgroundPosition: `${panX % (GRID * zoom)}px ${panY % (GRID * zoom)}px`,
  } : {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={onClose}>
      <Toaster position="top-center" richColors />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-[#f8fafc] rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* ====== Top Bar ====== */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div>
              <h3 className="text-foreground text-[0.88rem]">Floor Plan Editor</h3>
              <span className="text-[0.58rem] text-muted-foreground">{tableCount} tables · {wallCount} walls</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex bg-muted rounded-lg p-0.5 mr-1">
              <button onClick={() => { setEditMode(false); setTool('select'); }}
                className={`px-3 py-1.5 rounded-md text-[0.68rem] cursor-pointer transition-all ${!editMode ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}>View</button>
              <button onClick={() => setEditMode(true)}
                className={`px-3 py-1.5 rounded-md text-[0.68rem] cursor-pointer transition-all ${editMode ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}>Edit</button>
            </div>

            <ToolBtn onClick={undo} title="Undo" disabled={historyIdx <= 0}><Undo className="w-3.5 h-3.5" /></ToolBtn>
            <ToolBtn onClick={redo} title="Redo" disabled={historyIdx >= history.length - 1}><Redo className="w-3.5 h-3.5" /></ToolBtn>

            <div className="w-px h-6 bg-border mx-1" />

            <ToolBtn active={showGrid} onClick={() => setShowGrid(!showGrid)} title="Toggle grid"><Grid3X3 className="w-3.5 h-3.5" /></ToolBtn>

            {/* Fit to view */}
            <ToolBtn onClick={fitToView} title="Fit to view"><Maximize className="w-3.5 h-3.5" /></ToolBtn>

            {/* Zoom */}
            <div className="flex items-center gap-0 bg-white border border-border rounded-lg">
              <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, +(z - 0.1).toFixed(1)))} className="p-1.5 hover:bg-muted rounded-l-lg cursor-pointer">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-[0.6rem] text-foreground w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, +(z + 0.1).toFixed(1)))} className="p-1.5 hover:bg-muted rounded-r-lg cursor-pointer">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <button onClick={saveLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[0.7rem] cursor-pointer hover:brightness-110 transition-all">
              <Save className="w-3.5 h-3.5" /> Save
            </button>

            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted cursor-pointer ml-1">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ====== Left Sidebar ====== */}
          <AnimatePresence>
            {editMode && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white border-r border-border flex flex-col overflow-hidden shrink-0">
                <div className="p-3 flex-1 overflow-y-auto space-y-4">
                  <div>
                    <p className="text-[0.6rem] text-muted-foreground mb-2 uppercase tracking-wider">Tools</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <ToolBtn active={tool === 'select'} onClick={() => setTool('select')} title="Select & Move"><MousePointer className="w-4 h-4" /></ToolBtn>
                      <ToolBtn active={tool === 'erase'} onClick={() => setTool('erase')} title="Eraser"><Eraser className="w-4 h-4" /></ToolBtn>
                      <ToolBtn active={tool === 'addWall'} onClick={() => setTool('addWall')} title="Draw Wall"><Pencil className="w-4 h-4" /></ToolBtn>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.6rem] text-muted-foreground mb-2 uppercase tracking-wider">Add Table</p>
                    <button onClick={() => setTool('addTable')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-left ${tool === 'addTable' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tool === 'addTable' ? 'bg-primary text-white' : 'bg-muted'}`}><Plus className="w-4 h-4" /></div>
                      <div><p className="text-[0.72rem] text-foreground">New Table</p><p className="text-[0.55rem] text-muted-foreground">Click on canvas</p></div>
                    </button>
                  </div>

                  <div>
                    <p className="text-[0.6rem] text-muted-foreground mb-2 uppercase tracking-wider">Draw Wall</p>
                    <button onClick={() => setTool('addWall')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-left ${tool === 'addWall' ? 'border-[#78716c] bg-[#fafaf9] text-[#78716c]' : 'border-border hover:border-[#a8a29e] hover:bg-[#fafaf9] text-muted-foreground'}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tool === 'addWall' ? 'bg-[#78716c] text-white' : 'bg-muted'}`}><Pencil className="w-4 h-4" /></div>
                      <div><p className="text-[0.72rem] text-foreground">Wall Segment</p><p className="text-[0.55rem] text-muted-foreground">Click & drag</p></div>
                    </button>
                  </div>

                  <div>
                    <p className="text-[0.6rem] text-muted-foreground mb-2 uppercase tracking-wider">Areas & Fixtures</p>
                    <div className="space-y-1.5">
                      {(Object.entries(FIXTURE_CONFIG) as [FixtureType, typeof FIXTURE_CONFIG[FixtureType]][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isActive = tool === 'addFixture' && fixtureType === key;
                        return (
                          <button key={key} onClick={() => { setTool('addFixture'); setFixtureType(key); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all text-left ${isActive ? 'bg-opacity-15 border-2' : 'hover:bg-muted border-2 border-transparent'}`}
                            style={isActive ? { backgroundColor: cfg.bg, borderColor: cfg.border } : {}}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isActive ? cfg.border : '#f1f5f9' }}>
                              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#fff' : cfg.color }} />
                            </div>
                            <div><p className="text-[0.7rem] text-foreground">{cfg.label}</p><p className="text-[0.5rem] text-muted-foreground">{cfg.defaultW}×{cfg.defaultH}</p></div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====== Canvas Area ====== */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-1.5 border-b border-border bg-white shrink-0">
              {Object.entries(STATUS_COLORS).map(([status, cfg]) => (
                <span key={status} className="flex items-center gap-1.5 text-[0.58rem]" style={{ color: cfg.text }}>
                  <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cfg.fill, border: `1px solid ${cfg.stroke}` }} />
                  <span className="capitalize">{status}</span>
                </span>
              ))}
              <span className="ml-auto text-[0.55rem] text-muted-foreground">
                {spaceHeld ? '✋ Panning — release Space to stop' :
                  editMode
                    ? tool === 'addWall' ? '🖊 Click & drag to draw walls'
                      : tool === 'addTable' ? '📍 Click canvas to place table'
                      : tool === 'addFixture' ? `📍 Click to place ${FIXTURE_CONFIG[fixtureType].label}`
                      : tool === 'erase' ? '🗑 Click element to remove'
                      : '↔ Drag to move · Space/Scroll to pan · Ctrl+Scroll to zoom'
                    : 'Click table to select · Space/Scroll to pan · Ctrl+Scroll to zoom'
                }
              </span>
            </div>

            {/* Infinite Canvas */}
            <div
              ref={canvasRef}
              className={`flex-1 overflow-hidden relative ${getCursorClass()}`}
              style={{ backgroundColor: '#f1f5f9', ...gridBgStyle }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => { setDragging(null); setIsPanning(false); setWallStart(null); setWallPreview(null); }}
            >
              {/* Transformed world layer */}
              <div
                data-canvasbg="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  /* no width/height — infinite canvas */
                }}
              >
                {/* Render all elements */}
                {elements.map(el => {
                  const isSelected = selectedId === el.id;

                  /* === WALL === */
                  if (el.kind === 'wall') {
                    return (
                      <div key={el.id}
                        className={`absolute transition-shadow ${isSelected && editMode ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        style={{
                          left: el.x, top: el.y, width: el.w, height: el.h,
                          backgroundColor: '#78716c', borderRadius: 3,
                          cursor: isPanning || spaceHeld ? 'grabbing' : editMode ? (tool === 'erase' ? 'pointer' : el.locked ? 'default' : 'grab') : 'default',
                          zIndex: 5, boxShadow: isSelected ? '0 0 0 2px #FF6B35' : 'none',
                          transform: `rotate(${el.rotation}deg)`,
                        }}
                        onMouseDown={e => handleElementMouseDown(e, el)}
                      />
                    );
                  }

                  /* === FIXTURE === */
                  if (['billing', 'parcel', 'handwash', 'entrance', 'kitchen', 'display', 'stall', 'lounge'].includes(el.kind)) {
                    return (
                      <div key={el.id}
                        className={`absolute ${isSelected && editMode ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{
                          left: el.x, top: el.y, width: el.w, height: el.h,
                          cursor: isPanning || spaceHeld ? 'grabbing' : editMode ? (tool === 'erase' ? 'pointer' : el.locked ? 'default' : 'grab') : 'default',
                          zIndex: dragging === el.id ? 90 : 8, transform: `rotate(${el.rotation}deg)`,
                        }}
                        onMouseDown={e => handleElementMouseDown(e, el)}
                      >
                        {renderFixture(el)}
                        {editMode && isSelected && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-0.5 bg-white rounded-lg shadow-lg border border-border px-1 py-0.5 z-50">
                            <button onClick={e => { e.stopPropagation(); rotateElement(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Rotate"><RotateCw className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); resizeElement(el.id, 20, 0); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Wider"><RectangleHorizontal className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); duplicateElement(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Duplicate"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); toggleLock(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title={el.locked ? 'Unlock' : 'Lock'}>{el.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}</button>
                            <button onClick={e => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 hover:bg-red-50 rounded cursor-pointer" title="Delete"><Trash2 className="w-3 h-3 text-red-400" /></button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  /* === TABLE === */
                  if (el.kind === 'table') {
                    const cfg = STATUS_COLORS[el.status || 'available'] || STATUS_COLORS.available;
                    const isTableSelected = selectedTable === el.tableId;
                    return (
                      <div key={el.id} className="absolute"
                        style={{
                          left: el.x, top: el.y, width: el.w, height: el.h,
                          cursor: isPanning || spaceHeld ? 'grabbing' : editMode ? (tool === 'erase' ? 'pointer' : el.locked ? 'default' : 'grab') : 'pointer',
                          zIndex: dragging === el.id ? 100 : isSelected ? 50 : 10,
                        }}
                        onMouseDown={e => handleElementMouseDown(e, el)}
                      >
                        {renderSeats(el)}
                        <div className={`w-full h-full flex flex-col items-center justify-center border-2 transition-all ${isTableSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${dragging === el.id ? 'shadow-xl opacity-80' : 'shadow-sm'}`}
                          style={{
                            backgroundColor: cfg.fill, borderColor: isTableSelected ? '#FF6B35' : cfg.stroke,
                            borderRadius: el.shape === 'circle' ? '50%' : '12px', transform: `rotate(${el.rotation}deg)`,
                          }}>
                          <span className="text-[0.7rem]" style={{ color: cfg.text, transform: `rotate(-${el.rotation}deg)` }}>T{el.tableId}</span>
                          <span className="text-[0.48rem] flex items-center gap-0.5 opacity-70" style={{ color: cfg.text, transform: `rotate(-${el.rotation}deg)` }}>
                            <Armchair className="w-2.5 h-2.5" /> {el.seats}
                          </span>
                        </div>
                        {el.locked && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center z-20">
                            <Lock className="w-2 h-2 text-amber-600" />
                          </div>
                        )}
                        {editMode && isSelected && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex gap-0.5 bg-white rounded-lg shadow-lg border border-border px-1 py-0.5 z-50">
                            <button onClick={e => { e.stopPropagation(); removeChair(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Remove chair"><Minus className="w-3 h-3 text-red-400" /></button>
                            <span className="text-[0.6rem] flex items-center px-1 text-foreground tabular-nums">{el.seats}</span>
                            <button onClick={e => { e.stopPropagation(); addChair(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Add chair"><Plus className="w-3 h-3 text-green-500" /></button>
                            <div className="w-px h-5 bg-border mx-0.5" />
                            <button onClick={e => { e.stopPropagation(); rotateElement(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Rotate"><RotateCw className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); changeTableShape(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Change shape"><Square className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); duplicateElement(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title="Duplicate"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); toggleLock(el.id); }} className="p-1 hover:bg-muted rounded cursor-pointer" title={el.locked ? 'Unlock' : 'Lock'}>{el.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}</button>
                            <button onClick={e => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 hover:bg-red-50 rounded cursor-pointer" title="Delete table"><Trash2 className="w-3 h-3 text-red-400" /></button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Wall preview */}
                {wallPreview && (
                  <div className="absolute pointer-events-none"
                    style={{ left: wallPreview.x, top: wallPreview.y, width: wallPreview.w, height: wallPreview.h,
                      backgroundColor: 'rgba(120, 113, 108, 0.5)', borderRadius: 3, border: '2px dashed #78716c', zIndex: 200 }} />
                )}
              </div>

              {/* Pan hint overlay (shows briefly) */}
              {spaceHeld && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-xl text-[0.72rem] flex items-center gap-2 backdrop-blur-sm">
                    <Hand className="w-4 h-4" /> Panning mode
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ====== Right Panel ====== */}
          <AnimatePresence>
            {editMode && selected && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white border-l border-border flex flex-col overflow-hidden shrink-0">
                <div className="p-3 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-2">Properties</p>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-[0.78rem] text-foreground capitalize">{selected.kind === 'table' ? `Table T${selected.tableId}` : selected.kind}</p>
                      <p className="text-[0.58rem] text-muted-foreground mt-0.5">{selected.w} × {selected.h}px · ({selected.x}, {selected.y})</p>
                    </div>
                  </div>

                  {selected.kind === 'table' && (
                    <>
                      <div>
                        <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-2">Chairs</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeChair(selected.id)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all"><Minus className="w-4 h-4 text-red-400" /></button>
                          <div className="flex-1 text-center"><p className="text-[1.2rem] text-foreground tabular-nums">{selected.seats}</p><p className="text-[0.5rem] text-muted-foreground">chairs</p></div>
                          <button onClick={() => addChair(selected.id)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-green-50 hover:border-green-200 cursor-pointer transition-all"><Plus className="w-4 h-4 text-green-500" /></button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-2">Shape</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['square', 'circle', 'rect'] as const).map(shape => (
                            <button key={shape}
                              onClick={() => { const w = shape === 'rect' ? 120 : shape === 'square' ? 80 : 70; const h = shape === 'rect' ? 70 : shape === 'square' ? 80 : 70; updateElements(p => p.map(el => el.id === selected.id ? { ...el, shape, w, h } : el)); }}
                              className={`flex flex-col items-center gap-1 py-2 rounded-lg cursor-pointer transition-all text-[0.55rem] ${selected.shape === shape ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                              {shape === 'square' ? <Square className="w-3.5 h-3.5" /> : shape === 'circle' ? <Circle className="w-3.5 h-3.5" /> : <RectangleHorizontal className="w-3.5 h-3.5" />}
                              {shape === 'rect' ? 'Long' : shape.charAt(0).toUpperCase() + shape.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selected.kind !== 'table' && (
                    <div>
                      <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-2">Size</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] text-muted-foreground w-6">W</span>
                          <button onClick={() => resizeElement(selected.id, -GRID, 0)} className="p-1 border border-border rounded hover:bg-muted cursor-pointer"><Minus className="w-3 h-3" /></button>
                          <span className="flex-1 text-center text-[0.72rem] text-foreground tabular-nums">{selected.w}</span>
                          <button onClick={() => resizeElement(selected.id, GRID, 0)} className="p-1 border border-border rounded hover:bg-muted cursor-pointer"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] text-muted-foreground w-6">H</span>
                          <button onClick={() => resizeElement(selected.id, 0, -GRID)} className="p-1 border border-border rounded hover:bg-muted cursor-pointer"><Minus className="w-3 h-3" /></button>
                          <span className="flex-1 text-center text-[0.72rem] text-foreground tabular-nums">{selected.h}</span>
                          <button onClick={() => resizeElement(selected.id, 0, GRID)} className="p-1 border border-border rounded hover:bg-muted cursor-pointer"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
                    <div className="space-y-1.5">
                      <button onClick={() => rotateElement(selected.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors text-left">
                        <RotateCw className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[0.7rem] text-foreground">Rotate 45°</span>
                      </button>
                      <button onClick={() => duplicateElement(selected.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors text-left">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[0.7rem] text-foreground">Duplicate</span>
                      </button>
                      <button onClick={() => toggleLock(selected.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors text-left">
                        {selected.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="text-[0.7rem] text-foreground">{selected.locked ? 'Unlock' : 'Lock Position'}</span>
                      </button>
                      <button onClick={() => deleteElement(selected.id)} disabled={selected.locked}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" /><span className="text-[0.7rem] text-red-500">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

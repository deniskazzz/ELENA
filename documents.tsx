import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Download,
  Eye,
  FileText,
  LineChart,
  Paperclip,
  Pencil,
  ShoppingCart,
  Trash2,
  Upload,
  Utensils,
} from "lucide-react";
import { useHub } from "@/lib/store";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/states";
import { fmtDate, TODAY } from "@/lib/calc";
import { deleteFile, loadFile, saveFile } from "@/lib/file-store";
import type { DocCategory, HubDocument } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const cats: { id: DocCategory; label: string; icon: typeof FileText }[] = [
  { id: "ernaehrungsplan", label: "Ernährungsplan", icon: Utensils },
  { id: "einkaufsliste", label: "Einkaufslisten", icon: ShoppingCart },
  { id: "rezept", label: "Rezepte", icon: BookOpen },
  { id: "pdf", label: "PDFs", icon: FileText },
  { id: "fortschrittsbericht", label: "Fortschrittsberichte", icon: LineChart },
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xlsx,.txt";
const MAX_MB = 25;

async function storeUpload(file: File) {
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Die Datei ist größer als ${MAX_MB} MB.`);
  const fileId = await saveFile(file);
  return {
    fileId,
    fileName: file.name,
    sizeKb: Math.max(1, Math.round(file.size / 1024)),
    mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : ""),
  };
}

function useFileUrl(fileId: string | undefined, mimeType?: string) {
  const [state, setState] = useState<{ url: string | null; missing: boolean }>({ url: null, missing: false });
  useEffect(() => {
    if (!fileId) return;
    let url: string | null = null;
    let alive = true;
    loadFile(fileId).then((blob) => {
      if (!alive) return;
      if (!blob) return setState({ url: null, missing: true });
      const typed = mimeType && blob.type !== mimeType ? new Blob([blob], { type: mimeType }) : blob;
      url = URL.createObjectURL(typed);
      setState({ url, missing: false });
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId, mimeType]);
  return state;
}

function Viewer({ doc, onClose }: { doc: HubDocument; onClose: () => void }) {
  const { url, missing } = useFileUrl(doc.fileId, doc.mimeType);
  const isPdf = doc.mimeType === "application/pdf" || doc.fileName?.toLowerCase().endsWith(".pdf");
  const isImg = doc.mimeType?.startsWith("image/");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[90dvh] max-w-5xl flex-col gap-3 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{doc.title}</DialogTitle>
          <DialogDescription>{doc.fileName}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted">
          {missing ? (
            <p className="p-6 text-sm">Die Datei ist auf diesem Gerät nicht gespeichert. Bitte erneut hochladen.</p>
          ) : !url ? (
            <p className="p-6 text-sm text-muted-foreground">Datei wird geladen …</p>
          ) : isPdf ? (
            <iframe src={url} title={doc.title} className="size-full bg-white" />
          ) : isImg ? (
            <img src={url} alt={doc.title} className="size-full object-contain" />
          ) : (
            <p className="p-6 text-sm">Für diesen Dateityp gibt es keine Vorschau. Bitte herunterladen.</p>
          )}
        </div>
        {url && (
          <DialogFooter className="flex-row flex-wrap gap-2 sm:justify-start">
            <Button asChild className="rounded-full">
              <a href={url} download={doc.fileName}>
                <Download className="size-4" aria-hidden="true" /> Herunterladen
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href={url} target="_blank" rel="noopener noreferrer">
                In neuem Tab öffnen
              </a>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Editor({ doc, onClose }: { doc: HubDocument; onClose: () => void }) {
  const updateDocument = useHub((s) => s.updateDocument);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dokument bearbeiten</DialogTitle>
          <DialogDescription>Titel, Kategorie, Beschreibung oder Datei ändern.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const file = fd.get("file");
            const patch: Partial<HubDocument> = {
              title: String(fd.get("title") ?? "").trim() || doc.title,
              category: String(fd.get("category")) as DocCategory,
              description: String(fd.get("description") ?? "").trim(),
            };
            try {
              setBusy(true);
              if (file instanceof File && file.size > 0) {
                const stored = await storeUpload(file);
                if (doc.fileId) await deleteFile(doc.fileId);
                Object.assign(patch, stored);
              }
              updateDocument(doc.id, patch);
              toast.success("Dokument aktualisiert");
              onClose();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="etitle">Titel</Label>
            <Input id="etitle" name="title" defaultValue={doc.title} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ecat">Kategorie</Label>
            <NativeSelect id="ecat" name="category" defaultValue={doc.category} className="w-full">
              {cats.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>{c.label}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edesc">Beschreibung</Label>
            <Textarea id="edesc" name="description" rows={3} defaultValue={doc.description} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="efile">{doc.fileId ? "Datei ersetzen" : "Datei anhängen"}</Label>
            <Input id="efile" name="file" type="file" accept={ACCEPT} />
            {doc.fileName && <p className="text-xs text-muted-foreground">Aktuell: {doc.fileName}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Abbrechen</Button>
            <Button type="submit" className="rounded-full" disabled={busy}>
              {busy ? "Speichert …" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentsPage() {
  const docs = useHub((s) => s.documents);
  const role = useHub((s) => s.role);
  const addDocument = useHub((s) => s.addDocument);
  const removeDocument = useHub((s) => s.removeDocument);
  const confirm = useConfirm();
  const [filter, setFilter] = useState<DocCategory | "alle">("alle");
  const [viewing, setViewing] = useState<HubDocument | null>(null);
  const [editing, setEditing] = useState<HubDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const shown = docs.filter((d) => filter === "alle" || d.category === filter).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dokumente</h1>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-4">
          <nav aria-label="Kategorien" className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
            {[{ id: "alle" as const, label: "Alle", icon: ClipboardList }, ...cats].map((c) => {
              const count = c.id === "alle" ? docs.length : docs.filter((d) => d.category === c.id).length;
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    filter === c.id ? "bg-blue-950 text-white" : "bg-card text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {c.label}
                  <span className="ml-auto pl-2 text-xs tabular-nums opacity-80">{count}</span>
                </button>
              );
            })}
          </nav>

          <Card className="gap-3 p-4">
            <h2 className="font-bold">Dokument hochladen</h2>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const file = fd.get("file");
                const title = String(fd.get("title") ?? "").trim();
                const f = file instanceof File && file.size > 0 ? file : null;
                if (!title && !f) {
                  toast.error("Bitte Titel oder Datei angeben.");
                  return;
                }
                try {
                  setUploading(true);
                  const stored = f ? await storeUpload(f) : {};
                  addDocument({
                    title: title || f!.name.replace(/\.[^.]+$/, ""),
                    category: String(fd.get("category")) as DocCategory,
                    date: TODAY,
                    addedBy: role,
                    description: String(fd.get("description") ?? "").trim(),
                    ...stored,
                  });
                  toast.success("Dokument hinzugefügt");
                  form.reset();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Hochladen fehlgeschlagen");
                } finally {
                  setUploading(false);
                }
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="dfile">Datei (PDF, Bild, Word, Excel)</Label>
                <Input id="dfile" name="file" type="file" accept={ACCEPT} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dtitle">Titel</Label>
                <Input id="dtitle" name="title" placeholder="z. B. Rezept Protein-Pancakes" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dcat">Kategorie</Label>
                <NativeSelect id="dcat" name="category" defaultValue={filter === "alle" ? "rezept" : filter} key={filter} className="w-full">
                  {cats.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>{c.label}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ddesc">Beschreibung</Label>
                <Input id="ddesc" name="description" placeholder="z. B. 420 kcal · 35 g Protein" />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={uploading}>
                <Upload className="size-4" aria-hidden="true" /> {uploading ? "Lädt hoch …" : "Hochladen"}
              </Button>
            </form>
          </Card>
        </div>

        <section aria-label="Dokumentliste">
          {shown.length === 0 ? (
            <EmptyState icon={FileText} title="Keine Dokumente in dieser Kategorie" />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {shown.map((d) => {
                const cat = cats.find((c) => c.id === d.category) ?? cats[3];
                const Icon = cat.icon;
                return (
                  <li key={d.id}>
                    <Card className="h-full gap-3 p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-900" aria-hidden="true">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold leading-snug">{d.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {cat.label} · {fmtDate(d.date, { day: "2-digit", month: "2-digit", year: "numeric" })} · {d.addedBy === "coach" ? "Coach" : "Elena"}
                          </p>
                        </div>
                      </div>
                      {d.description && <p className="text-sm">{d.description}</p>}
                      <p className="min-w-0 truncate text-xs text-muted-foreground">
                        {d.fileId ? `${d.fileName ?? "Datei"}${d.sizeKb ? ` · ${d.sizeKb} KB` : ""}` : "Noch keine Datei angehängt"}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-border pt-3">
                        {d.fileId ? (
                          <Button type="button" size="sm" className="rounded-full" onClick={() => setViewing(d)}>
                            <Eye className="size-4" aria-hidden="true" /> Ansehen
                          </Button>
                        ) : (
                          <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(d)}>
                            <Paperclip className="size-4" aria-hidden="true" /> Datei anhängen
                          </Button>
                        )}
                        <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => setEditing(d)}>
                          <Pencil className="size-4" aria-hidden="true" /> Bearbeiten
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          aria-label={`${d.title} löschen`}
                          onClick={async () => {
                            if (await confirm({ title: "Dokument löschen?", description: d.title, confirmLabel: "Löschen", destructive: true })) {
                              if (d.fileId) await deleteFile(d.fileId);
                              removeDocument(d.id);
                            }
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {viewing && <Viewer doc={viewing} onClose={() => setViewing(null)} />}
      {editing && <Editor key={editing.id} doc={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

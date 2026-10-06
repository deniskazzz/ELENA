import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PdfExportButton } from "@/components/pdf-export-button";
import { CircumferenceChart, DataTableDisclosure, WeightChart } from "@/components/charts";
import { fmt1, fmtDate, signed1, sortedCheckIns, TODAY } from "@/lib/calc";
import type { CheckIn, ProgressPhoto } from "@/lib/types";
import { toast } from "sonner";
import { saveFile } from "@/lib/file-store";

const avg = (list: CheckIn[], k: "energy" | "hunger" | "sleep") =>
  list.length ? list.reduce((a, c) => a + c[k], 0) / list.length : 0;

function PhotoSlot({ label, photos }: { label: ProgressPhoto["label"]; photos: ProgressPhoto[] }) {
  const addPhoto = useHub((s) => s.addPhoto);
  const removePhoto = useHub((s) => s.removePhoto);
  const inputId = `photo-${label}`;
  const latest = photos[photos.length - 1];
  const title = label === "vorher" ? "Vorher" : "Nachher";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {latest && (
          <Button type="button" variant="ghost" size="icon" aria-label={`${title}-Bild entfernen`} onClick={() => removePhoto(latest.id)}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-dashed border-border bg-muted/50">
        {latest ? (
          <>
            <img src={latest.url} alt={`${title}-Bild vom ${fmtDate(latest.date)}`} className="size-full object-cover" />
            <span className="absolute bottom-2 left-2 rounded-full bg-blue-950/85 px-2.5 py-1 text-xs font-medium text-white">
              {fmtDate(latest.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </>
        ) : (
          <label htmlFor={inputId} className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground hover:bg-muted">
            <ImagePlus className="size-8" aria-hidden="true" />
            Bild hochladen
          </label>
        )}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          addPhoto({ label, date: TODAY, url: URL.createObjectURL(file) });
          e.target.value = "";
        }}
      />
      {latest && (
        <Button asChild variant="outline" size="sm" className="w-full rounded-full">
          <label htmlFor={inputId} className="cursor-pointer">Bild ersetzen</label>
        </Button>
      )}
    </div>
  );
}

export function ProgressPage() {
  const profile = useHub((s) => s.profile);
  const raw = useHub((s) => s.checkIns);
  const photos = useHub((s) => s.photos);
  const addDocument = useHub((s) => s.addDocument);
  const reportRef = useRef<HTMLDivElement>(null);
  const checkIns = sortedCheckIns(raw);
  const first = checkIns[0];
  const last = checkIns[checkIns.length - 1];

  if (!first || !last) {
    return <p>Noch keine Check-ins vorhanden.</p>;
  }

  const weeks = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (7 * 864e5));
  const dW = last.weight - first.weight;
  const perWeek = dW / weeks;
  const dHip = last.hip - first.hip;
  const dWaist = last.waist - first.waist;
  const toGoal = last.weight - profile.goalWeight;
  const early = checkIns.slice(0, 4);
  const recent = checkIns.slice(-4);
  const weeksToGoal = perWeek < 0 ? Math.ceil(toGoal / Math.abs(perWeek)) : null;

  const stats = [
    { l: "Gewicht", v: `${signed1(dW)} kg`, s: `${fmt1(first.weight)} → ${fmt1(last.weight)} kg` },
    { l: "Ø pro Woche", v: `${signed1(perWeek)} kg`, s: `über ${Math.round(weeks)} Wochen` },
    { l: "Hüfte", v: `${signed1(dHip)} cm`, s: `${fmt1(first.hip)} → ${fmt1(last.hip)} cm` },
    { l: "Bauch", v: `${signed1(dWaist)} cm`, s: `${fmt1(first.waist)} → ${fmt1(last.waist)} cm` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Fortschritt</h1>
        <div data-pdf-exclude>
          <PdfExportButton
            targetRef={reportRef}
            fileName={`Fortschrittsbericht_Elena_${TODAY}.pdf`}
            onGenerated={async ({ blob, fileName, byteLength }) => {
              const fileId = await saveFile(blob);
              addDocument({
                title: `Fortschrittsbericht ${fmtDate(TODAY, { day: "2-digit", month: "long", year: "numeric" })}`,
                category: "fortschrittsbericht",
                date: TODAY,
                addedBy: useHub.getState().role,
                description: `${signed1(dW)} kg, ${signed1(dHip)} cm Hüfte, ${signed1(dWaist)} cm Bauch seit Start.`,
                fileName,
                sizeKb: Math.round(byteLength / 1024),
                mimeType: "application/pdf",
                fileId,
              });
              toast.success("Bericht im Dokumentenbereich abgelegt");
            }}
          >
            Bericht als PDF
          </PdfExportButton>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 bg-background">
        <Card className="gap-4 bg-gradient-to-br from-blue-950 to-blue-800 p-5 text-white sm:p-6">
          <h2 className="text-lg font-bold">Zusammenfassung der Entwicklung</h2>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <dt className="text-xs uppercase tracking-wider text-blue-200">{s.l}</dt>
                <dd className="text-2xl font-bold tabular-nums text-emerald-300">{s.v}</dd>
                <dd className="text-xs text-blue-100">{s.s}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm leading-relaxed text-blue-50">
            Seit dem {fmtDate(first.date, { day: "2-digit", month: "long" })} hat Elena {fmt1(Math.abs(dW))} kg verloren – im Schnitt{" "}
            {fmt1(Math.abs(perWeek))} kg pro Woche. Bis zum Zielgewicht von {fmt1(profile.goalWeight)} kg fehlen noch {fmt1(Math.max(0, toGoal))} kg
            {weeksToGoal !== null && toGoal > 0 ? `, bei gleichem Tempo etwa ${weeksToGoal} Wochen` : ""}. Energie im Schnitt{" "}
            {fmt1(avg(early, "energy"))} → {fmt1(avg(recent, "energy"))}, Hunger {fmt1(avg(early, "hunger"))} → {fmt1(avg(recent, "hunger"))}, Schlaf{" "}
            {fmt1(avg(early, "sleep"))} → {fmt1(avg(recent, "sleep"))} (erste vs. letzte 4 Check-ins).
          </p>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-1 p-5">
            <h2 className="text-lg font-bold">Gewicht</h2>
            <p className="mb-2 text-sm text-muted-foreground">
              {signed1(dW)} kg seit Start · Ziellinie {fmt1(profile.goalWeight)} kg
            </p>
            <WeightChart checkIns={checkIns} goal={profile.goalWeight} />
            <div data-pdf-exclude>
              <DataTableDisclosure summary="Werte als Tabelle" head={["Datum", "kg"]} rows={checkIns.map((c) => [fmtDate(c.date), fmt1(c.weight)])} />
            </div>
          </Card>
          <Card className="gap-1 p-5">
            <h2 className="text-lg font-bold">Umfänge</h2>
            <p className="mb-2 text-sm text-muted-foreground">
              Hüfte {signed1(dHip)} cm (durchgezogen) · Bauch {signed1(dWaist)} cm (gestrichelt)
            </p>
            <CircumferenceChart checkIns={checkIns} />
            <div data-pdf-exclude>
              <DataTableDisclosure
                summary="Werte als Tabelle"
                head={["Datum", "Hüfte (cm)", "Bauch (cm)"]}
                rows={checkIns.map((c) => [fmtDate(c.date), fmt1(c.hip), fmt1(c.waist)])}
              />
            </div>
          </Card>
        </div>
      </div>

      <Card className="gap-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Vorher-Nachher-Bilder</h2>
        <div className="grid grid-cols-2 gap-4 sm:max-w-xl">
          <PhotoSlot label="vorher" photos={photos.filter((p) => p.label === "vorher")} />
          <PhotoSlot label="nachher" photos={photos.filter((p) => p.label === "nachher")} />
        </div>
        <p className="text-xs text-muted-foreground">Bilder bleiben nur in der aktuellen Sitzung sichtbar und werden nicht dauerhaft gespeichert.</p>
      </Card>
    </div>
  );
}

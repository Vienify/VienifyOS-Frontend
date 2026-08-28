// Tab Tài liệu — card lưới 4 cột, thumbnail trang đầu, tìm kiếm, xem trước; leader/admin được đăng/đổi tên/xoá
import { useEffect, useRef, useState } from "react";
import { Download, Eye, FileText, PenLine, Search, Trash2, X } from "lucide-react";
import { Api, Biz, Card, Notify, inpCls } from "./shared";

type Doc = Biz["documents"][number];

const IMG_RE = /\.(png|jpe?g|gif|webp|svg)$/i;
const DOCX_RE = /\.docx$/i;
const ext = (name: string) => (name.split(".").pop() || "").toUpperCase();

// Render file DOCX bằng docx-preview: thumb = trang đầu thu nhỏ vừa khung, ngược lại = bản đầy đủ cuộn được
function DocxRender({ data, thumb }: { data: ArrayBuffer; thumb?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        if (dead || !inner.current) return;
        await renderAsync(data.slice(0), inner.current, undefined, { inWrapper: !thumb, breakPages: true });
        if (dead || !thumb || !wrap.current || !inner.current) return;
        const page = inner.current.querySelector("section") as HTMLElement | null;
        const w = page?.offsetWidth || 794;
        inner.current.style.width = `${w}px`;
        inner.current.style.transform = `scale(${wrap.current.clientWidth / w})`;
      } catch (err) { console.warn("Không render được DOCX:", err); }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  if (thumb) return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden bg-white">
      <div ref={inner} className="origin-top-left" />
    </div>
  );
  return <div className="h-[78vh] overflow-auto bg-neutral-300"><div ref={inner} /></div>;
}

export default function DocsTab({ biz, isLeader, api, notify, reload, askConfirm }: {
  biz: Biz; isLeader: boolean; api: Api; notify: Notify; reload: () => void;
  askConfirm: (msg: string, onOk: () => void) => void;
}) {
  const [q, setQ] = useState("");
  const [thumbs, setThumbs] = useState<Record<number, string | null>>({});
  const [docxBufs, setDocxBufs] = useState<Record<number, ArrayBuffer>>({});
  const [preview, setPreview] = useState<{ d: Doc; url: string; kind: "pdf" | "img" | "docx" | "other"; buf?: ArrayBuffer } | null>(null);
  const [renameDoc, setRenameDoc] = useState<{ id: number; name: string } | null>(null);
  const busy = useRef<Set<number>>(new Set());

  async function uploadDoc(file: File) {
    if (file.size > 7 * 1024 * 1024) return notify("File tối đa 7MB");
    const b64 = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok((r.result as string).split(",")[1]); r.readAsDataURL(file); });
    const r = await api("/api/business/documents", { method: "POST", body: JSON.stringify({ name: file.name, mime: file.type, data: b64 }) });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify("Đã đăng tài liệu", "success"); reload();
  }

  async function openDoc(d: { id: number; name: string }, download: boolean) {
    const r = await api(`/api/business/documents/${d.id}${download ? "?download=1" : ""}`);
    if (!r.ok) return notify((await r.json()).message || "Không mở được file");
    const url = URL.createObjectURL(await r.blob());
    if (download) { const a = document.createElement("a"); a.href = url; a.download = d.name; a.click(); }
    else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  // Xem trước tài liệu trong modal: PDF/ảnh render trực tiếp, loại khác gợi ý tải về
  async function openPreview(d: Doc) {
    if (!d.hasFile) return;
    const r = await api(`/api/business/documents/${d.id}`);
    if (!r.ok) return notify((await r.json()).message || "Không mở được file");
    const blob = await r.blob();
    const isPdf = blob.type === "application/pdf" || /\.pdf$/i.test(d.name);
    const isImg = blob.type.startsWith("image/") || IMG_RE.test(d.name);
    const isDocx = DOCX_RE.test(d.name);
    setPreview({
      d, url: URL.createObjectURL(blob),
      kind: isPdf ? "pdf" : isImg ? "img" : isDocx ? "docx" : "other",
      buf: isDocx ? await blob.arrayBuffer() : undefined,
    });
  }
  function closePreview() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  async function deleteDoc(d: Doc) {
    const r = await api(`/api/business/documents/${d.id}`, { method: "DELETE" });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify("Đã xoá tài liệu", "success"); reload();
  }

  async function submitRename() {
    if (!renameDoc) return;
    if (!renameDoc.name.trim()) return notify("Tên tài liệu không được trống");
    const r = await api(`/api/business/documents/${renameDoc.id}`, { method: "PUT", body: JSON.stringify({ name: renameDoc.name.trim() }) });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify("Đã đổi tên tài liệu", "success"); setRenameDoc(null); reload();
  }

  // Sinh thumbnail trang đầu: PDF render qua pdfjs, DOCX qua docx-preview, ảnh dùng chính file; loại khác không có preview
  useEffect(() => {
    for (const d of biz.documents) {
      if (!d.hasFile || d.id in thumbs || busy.current.has(d.id)) continue;
      const isPdf = d.type === "PDF" || /\.pdf$/i.test(d.name);
      const isImg = IMG_RE.test(d.name);
      const isDocx = DOCX_RE.test(d.name);
      if (!isPdf && !isImg && !isDocx) { setThumbs((t) => ({ ...t, [d.id]: null })); continue; }
      busy.current.add(d.id);
      (async () => {
        try {
          const r = await api(`/api/business/documents/${d.id}`);
          if (!r.ok) return setThumbs((t) => ({ ...t, [d.id]: null }));
          const blob = await r.blob();
          if (isDocx) {
            const buf = await blob.arrayBuffer();
            setDocxBufs((b) => ({ ...b, [d.id]: buf }));
            setThumbs((t) => ({ ...t, [d.id]: null }));
          } else if (isImg) {
            const dataUrl = await new Promise<string>((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result as string); fr.readAsDataURL(blob); });
            setThumbs((t) => ({ ...t, [d.id]: dataUrl }));
          } else {
            const pdfjs = await import("pdfjs-dist");
            pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            const task = pdfjs.getDocument({ data: await blob.arrayBuffer() });
            const pdf = await task.promise;
            const page = await pdf.getPage(1);
            const vp = page.getViewport({ scale: 1 });
            const scale = 480 / vp.width;
            const view = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = view.width; canvas.height = view.height;
            // intent "print": render không phụ thuộc requestAnimationFrame (không treo khi tab chạy nền)
            await page.render({ canvas, viewport: view, intent: "print" }).promise;
            setThumbs((t) => ({ ...t, [d.id]: canvas.toDataURL("image/jpeg", 0.8) }));
            task.destroy();
          }
        } catch (err) {
          console.warn("Không tạo được thumbnail:", d.name, err);
          setThumbs((t) => ({ ...t, [d.id]: null }));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biz.documents]);

  const s = q.trim().toLowerCase();
  const docs = biz.documents.filter((d) =>
    !s || d.name.toLowerCase().includes(s) || d.type.toLowerCase().includes(s) || (d.byName || "").toLowerCase().includes(s));

  const Thumb = ({ d }: { d: Doc }) => {
    const t = thumbs[d.id];
    if (t) return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={t} alt={d.name} className="w-full h-full object-cover object-top" />
    );
    if (docxBufs[d.id]) return <DocxRender data={docxBufs[d.id]} thumb />;
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex flex-col items-center gap-2 text-slate-600">
          <FileText size={36} strokeWidth={1.2} />
          <span className="text-xs font-bold tracking-widest">{ext(d.name) || d.type.toUpperCase()}</span>
        </div>
      </div>
    );
  };

  return (
    <Card title={`Tài liệu (${biz.documents.length})`}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {isLeader && (
          <label className="inline-block px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold cursor-pointer">
            Đăng tài liệu
            <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ""; }} />
          </label>
        )}
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className={inpCls + " w-full pl-9"} placeholder="Tìm theo tên, loại, người đăng..." value={q}
            onChange={(e) => setQ(e.target.value)} />
        </div>
        {s && <span className="text-xs text-slate-500">{docs.length} kết quả</span>}
      </div>

      {docs.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {docs.map((d) => (
            <div key={d.id} className="group rounded-2xl bg-white/5 hover:bg-white/10 transition overflow-hidden flex flex-col">
              <button onClick={() => openPreview(d)}
                className={`relative block w-full aspect-[4/3] bg-slate-950/60 overflow-hidden ${d.hasFile ? "cursor-pointer" : "cursor-default"}`}
                title={d.hasFile ? "Xem trước tài liệu" : undefined}>
                <Thumb d={d} />
              </button>
              <div className="p-3.5 flex flex-col gap-1 flex-1">
                <p className="text-sm font-medium truncate" title={d.name}>{d.name}</p>
                <p className="text-xs text-slate-500">{d.type} · {d.size}</p>
                <p className="text-xs text-slate-500">{d.updated} · {d.byName || "—"}</p>
                <div className="flex items-center gap-1.5 mt-auto pt-2">
                  {d.hasFile && (
                    <>
                      <button onClick={() => openPreview(d)}
                        className="p-1 text-slate-300 hover:text-white" aria-label="Xem" title="Xem trước">
                        <Eye size={21} strokeWidth={1.8} />
                      </button>
                      <button onClick={() => openDoc(d, true)}
                        className="p-1 text-slate-300 hover:text-white" aria-label="Tải về" title="Tải về">
                        <Download size={21} strokeWidth={1.8} />
                      </button>
                    </>
                  )}
                  {isLeader && (
                    <span className="flex gap-1.5 ml-auto">
                      <button onClick={() => setRenameDoc({ id: d.id, name: d.name })}
                        className="p-1 text-slate-400 hover:text-white" aria-label="Đổi tên" title="Đổi tên">
                        <PenLine size={19} strokeWidth={1.8} />
                      </button>
                      <button onClick={() => askConfirm(`Xoá tài liệu “${d.name}”?`, () => deleteDoc(d))}
                        className="p-1 text-red-400 hover:text-red-300" aria-label="Xoá" title="Xoá">
                        <Trash2 size={19} strokeWidth={1.8} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{s ? "Không tìm thấy tài liệu phù hợp" : "Chưa có tài liệu"}</p>
      )}

      {/* Modal xem trước tài liệu */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={closePreview}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 p-4 border-b border-neutral-800/80">
              <p className="font-semibold truncate" title={preview.d.name}>{preview.d.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openDoc(preview.d, true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">
                  <Download size={13} />Tải về
                </button>
                <button onClick={closePreview}
                  className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Đóng">
                  <X size={16} />
                </button>
              </div>
            </div>
            {preview.kind === "pdf" && <iframe src={preview.url} title={preview.d.name} className="w-full h-[78vh] bg-white" />}
            {preview.kind === "docx" && preview.buf && <DocxRender data={preview.buf} />}
            {preview.kind === "img" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.d.name} className="max-h-[78vh] w-auto object-contain mx-auto p-4" />
            )}
            {preview.kind === "other" && (
              <div className="grid place-items-center h-64">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <FileText size={40} strokeWidth={1.2} />
                  <p className="text-sm">Trình duyệt không hỗ trợ xem trước định dạng {ext(preview.d.name)} — hãy tải về để mở</p>
                  <button onClick={() => openDoc(preview.d, true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
                    <Download size={15} />Tải về
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal đổi tên tài liệu */}
      {renameDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setRenameDoc(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">Đổi tên tài liệu</p>
            <input className={inpCls + " w-full"} value={renameDoc.name} autoFocus
              onChange={(e) => setRenameDoc({ ...renameDoc, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submitRename()} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameDoc(null)}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
              <button onClick={submitRename}
                className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

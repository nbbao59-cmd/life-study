import { BookOpen, Download, File as FileIcon, FileSpreadsheet, FileText, FolderOpen, Image as ImageIcon, Presentation, Search, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';
import { DocumentCategory, DocumentItem } from '../../types';
import { uid } from '../../utils/helpers';
import { listDocuments, readDocument, removeDocument, saveDocument } from '../../services/documentStorage';

type Filter = 'all' | DocumentCategory;
type Notice = { kind: 'success' | 'error'; text: string } | null;

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp';
const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  pdf: 'PDF',
  word: 'Word',
  sheet: 'Bảng tính',
  slide: 'Trình chiếu',
  image: 'Hình ảnh',
  text: 'Văn bản',
  other: 'Tệp khác',
};
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pdf', label: 'PDF' },
  { id: 'word', label: 'Word' },
  { id: 'sheet', label: 'Bảng tính' },
  { id: 'slide', label: 'Trình chiếu' },
  { id: 'image', label: 'Hình ảnh' },
  { id: 'text', label: 'Văn bản' },
];

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function categoryFor(name: string): DocumentCategory {
  const ext = extension(name);
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx'].includes(ext)) return 'slide';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (['txt', 'md'].includes(ext)) return 'text';
  return 'other';
}

function fileIcon(category: DocumentCategory) {
  if (category === 'sheet') return <FileSpreadsheet size={19} />;
  if (category === 'slide') return <Presentation size={19} />;
  if (category === 'image') return <ImageIcon size={19} />;
  if (category === 'other') return <FileIcon size={19} />;
  return <FileText size={19} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [notice, setNotice] = useState<Notice>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    void listDocuments()
      .then((items) => { if (mounted) setDocuments(items); })
      .catch((err: any) => {
        if (mounted) {
          setNotice({
            kind: 'error',
            text: err?.message || 'Không mở được kho tài liệu IndexedDB trên trình duyệt này.',
          });
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const visibleDocuments = useMemo(() => documents.filter((item) => {
    const matchesSearch = item.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'));
    const matchesFilter = filter === 'all' || categoryFor(item.name) === filter;
    return matchesSearch && matchesFilter;
  }), [documents, filter, search]);

  const totalSize = documents.reduce((sum, item) => sum + item.size, 0);

  const addFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    setBusy(true);
    setNotice(null);
    let added = 0;
    const rejected: string[] = [];
    try {
      for (const file of selected) {
        const kind = categoryFor(file.name);
        if (kind === 'other') {
          rejected.push(file.name);
          continue;
        }
        const item: DocumentItem = {
          id: uid(),
          name: file.name,
          type: file.type || extension(file.name),
          size: file.size,
          addedAt: new Date().toISOString(),
        };
        await saveDocument(item, file);
        added += 1;
      }
      setDocuments(await listDocuments());
      if (rejected.length) {
        setNotice({
          kind: added ? 'success' : 'error',
          text: `${added ? `Đã lưu ${added} tài liệu. ` : ''}Bỏ qua định dạng chưa hỗ trợ: ${rejected.join(', ')}`,
        });
      } else {
        setNotice({ kind: 'success', text: `Đã lưu ${added} tài liệu an toàn vào bộ nhớ máy tính.` });
      }
    } catch (err: any) {
      setDocuments(await listDocuments().catch(() => documents));
      const message = err?.message || 'Không lưu được tệp. Bộ nhớ trình duyệt có thể đã đầy hoặc gặp sự cố.';
      setNotice({ kind: 'error', text: message });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => { void addFiles(event.target.files ?? []); };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  const download = async (item: DocumentItem) => {
    try {
      const blob = await readDocument(item.id);
      if (!blob) throw new Error('not found');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setNotice({ kind: 'error', text: 'Không đọc được tài liệu. Hãy tải lại trang rồi thử lại.' });
    }
  };

  const remove = async (item: DocumentItem) => {
    if (!window.confirm(`Xóa “${item.name}” khỏi thư viện tài liệu?`)) return;
    try {
      await removeDocument(item.id);
      setDocuments((current) => current.filter((document) => document.id !== item.id));
      setNotice({ kind: 'success', text: 'Đã xóa tài liệu khỏi thiết bị này.' });
    } catch {
      setNotice({ kind: 'error', text: 'Không xóa được tài liệu. Hãy thử lại.' });
    }
  };

  return (
    <div className="stack document-page">
      <PageTitle icon={<BookOpen size={22} />} title="Thư viện tài liệu" subtitle="Lưu đề cương, bài giảng và tài liệu học tập cục bộ an toàn" />

      <section className="document-hero">
        <div className="document-hero-copy">
          <span className="document-eyebrow"><ShieldCheck size={15} /> Lưu trữ riêng tư trên thiết bị (IndexedDB)</span>
          <h3>Không gian tài liệu học tập của bạn</h3>
          <p>Tìm lại tài liệu nhanh chóng, tải xuống khi cần và sắp xếp gọn gàng theo từng phân loại mà không tải lên máy chủ.</p>
        </div>
        <div className="document-hero-stats" aria-label="Thống kê thư viện">
          <div><strong>{documents.length}</strong><span>Tài liệu</span></div>
          <div><strong>{formatBytes(totalSize)}</strong><span>Đang lưu</span></div>
        </div>
        <div className="document-hero-mark"><FolderOpen size={96} strokeWidth={1.1} /></div>
      </section>

      <section
        className={`document-dropzone ${dragging ? 'dragging' : ''} ${busy ? 'busy' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="document-upload-icon"><Upload size={22} /></div>
        <div className="document-drop-copy">
          <h3>{busy ? 'Đang lưu tài liệu…' : 'Thêm tài liệu vào thư viện'}</h3>
          <p>Kéo thả tệp vào đây hoặc chọn từ thiết bị. Hỗ trợ PDF, Word, Excel, PowerPoint, Ảnh và Tệp văn bản.</p>
        </div>
        <label className="btn document-pick" htmlFor="document-picker"><Upload size={16} /> Chọn tệp</label>
        <input ref={inputRef} className="visually-hidden" id="document-picker" type="file" accept={ACCEPT} multiple onChange={onPick} disabled={busy} />
      </section>

      {notice && <div className={`document-notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</div>}

      <section className="card document-library">
        <div className="document-toolbar">
          <div>
            <span className="document-eyebrow navy"><FolderOpen size={15} /> BỘ SƯU TẬP</span>
            <h3>Tài liệu của tôi</h3>
            <p className="muted">Toàn bộ tệp được lưu trong cơ sở dữ liệu IndexedDB của trình duyệt máy bạn.</p>
          </div>
          <label className="document-search">
            <Search size={17} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tài liệu theo tên…" aria-label="Tìm tài liệu" />
          </label>
        </div>

        <div className="chips document-filters" role="group" aria-label="Lọc tài liệu">
          {FILTERS.map((item) => (
            <button key={item.id} className={`chip ${filter === item.id ? 'on' : ''}`} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}>
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="document-empty"><span className="document-empty-icon"><FolderOpen size={25} /></span><strong>Đang mở thư viện…</strong></div>
        ) : visibleDocuments.length ? (
          <div className="document-list">
            {visibleDocuments.map((item) => {
              const category = categoryFor(item.name);
              return (
                <article className="document-row" key={item.id}>
                  <div className={`document-file-icon ${category}`}>{fileIcon(category)}</div>
                  <div className="document-file-info">
                    <strong title={item.name}>{item.name}</strong>
                    <span>{CATEGORY_LABEL[category]} <i /> {formatBytes(item.size)} <i /> {formatDate(item.addedAt)}</span>
                  </div>
                  <div className="document-actions">
                    <button className="icon-btn document-download" onClick={() => void download(item)} aria-label={`Tải xuống ${item.name}`} title="Tải xuống"><Download size={17} /></button>
                    <button className="icon-btn danger" onClick={() => void remove(item)} aria-label={`Xóa ${item.name}`} title="Xóa"><Trash2 size={17} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="document-empty">
            <span className="document-empty-icon"><FolderOpen size={25} /></span>
            <strong>{search || filter !== 'all' ? 'Không tìm thấy tài liệu phù hợp' : 'Thư viện của bạn đang trống'}</strong>
            <span>{search || filter !== 'all' ? 'Thử từ khóa khác hoặc chọn bộ lọc khác.' : 'Kéo thả hoặc chọn tài liệu đầu tiên để bắt đầu sắp xếp góc học tập.'}</span>
          </div>
        )}
      </section>
      <p className="document-privacy"><ShieldCheck size={14} /> Tài liệu chỉ lưu trữ cục bộ trong IndexedDB của trình duyệt máy bạn, không gửi lên bất kỳ máy chủ nào.</p>
    </div>
  );
}

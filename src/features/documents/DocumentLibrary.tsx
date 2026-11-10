import {
  Download,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { SunkenTreasureIllustration } from '../../components/illustrations/OceanIllustrations';
import PageTitle from '../../components/ui/PageTitle';
import { listDocuments, readDocument, removeDocument, saveDocument } from '../../services/documentStorage';
import { DocumentCategory, DocumentItem, SectionId } from '../../types';
import { uid } from '../../utils/helpers';
import DocumentAiDrawer from './DocumentAiDrawer';

export interface DocumentLibraryProps {
  onNavigate?: (section: SectionId) => void;
}

type Filter = 'all' | DocumentCategory;
type Notice = { kind: 'success' | 'error'; text: string } | null;

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp';
const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  pdf: 'Hải Đồ PDF',
  word: 'Văn Thư Word',
  sheet: 'Bảng Tính',
  slide: 'Trình Chiếu',
  image: 'Hình Ảnh',
  text: 'Văn Bản',
  other: 'Tệp Khác',
};
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tất cả kho báu' },
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

export default function DocumentLibrary({ onNavigate }: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [notice, setNotice] = useState<Notice>(null);
  const [selectedForAi, setSelectedForAi] = useState<DocumentItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    void listDocuments()
      .then((items) => {
        if (mounted) setDocuments(items);
      })
      .catch((err: any) => {
        if (mounted) {
          setNotice({
            kind: 'error',
            text: err?.message || 'Không mở được kho tài liệu IndexedDB trên trình duyệt này.',
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleDocuments = useMemo(
    () =>
      documents.filter((item) => {
        const matchesSearch = item.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'));
        const matchesFilter = filter === 'all' || categoryFor(item.name) === filter;
        return matchesSearch && matchesFilter;
      }),
    [documents, filter, search]
  );

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
        setNotice({ kind: 'success', text: `Đã lưu an toàn ${added} tệp vào Hầm Ngọc Trai cục bộ.` });
      }
    } catch (err: any) {
      setDocuments(await listDocuments().catch(() => documents));
      const message = err?.message || 'Không lưu được tệp. Bộ nhớ máy có thể đã đầy.';
      setNotice({ kind: 'error', text: message });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(event.target.files ?? []);
  };
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
      setNotice({ kind: 'error', text: 'Không đọc được văn thư. Hãy thử lại.' });
    }
  };

  const remove = async (item: DocumentItem) => {
    if (!window.confirm(`Xóa văn thư “${item.name}” khỏi kho báu đáy biển?`)) return;
    try {
      await removeDocument(item.id);
      setDocuments((current) => current.filter((document) => document.id !== item.id));
      if (selectedForAi?.id === item.id) {
        setSelectedForAi(null);
      }
      setNotice({ kind: 'success', text: 'Đã xóa tài liệu khỏi hầm ngọc trai.' });
    } catch {
      setNotice({ kind: 'error', text: 'Không xóa được tài liệu. Hãy thử lại.' });
    }
  };

  return (
    <div className="stack document-page ocean-document-page">
      <PageTitle
        icon={<FolderOpen size={22} />}
        title="Kho Báu Văn Thư Đáy Biển"
        subtitle="Hầm lưu trữ đề cương, bài giảng và tài liệu học tập riêng tư an toàn"
      />

      {/* Ocean Sunken Treasure Hero */}
      <section className="document-hero ocean-treasure-hero">
        <div className="document-hero-copy">
          <span className="document-eyebrow">
            <ShieldCheck size={15} /> Hầm lưu trữ ngọc trai cục bộ (IndexedDB Bảo Mật)
          </span>
          <h3>Kho Báu Tri Thức Đáy Biển</h3>
          <p>
            Mọi bài giảng, đề thi và sách học của bạn được lưu an toàn tuyệt đối ngay trên máy tính.
            Hỏi đáp AI tức thì và đúc thành thẻ Flashcard 3D mà không rò rỉ dữ liệu ra ngoài.
          </p>
        </div>
        <div className="document-hero-stats ocean-stats-badge" aria-label="Thống kê thư viện">
          <div>
            <strong>{documents.length}</strong>
            <span>Văn thư</span>
          </div>
          <div>
            <strong>{formatBytes(totalSize)}</strong>
            <span>Dung lượng</span>
          </div>
        </div>
        <div className="ocean-hero-chest-illustration">
          <SunkenTreasureIllustration width={170} height={120} />
        </div>
      </section>

      {/* Pearl Dredge Net Upload Dropzone */}
      <section
        className={`document-dropzone ocean-dropzone ${dragging ? 'dragging' : ''} ${busy ? 'busy' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="document-upload-icon ocean-upload-icon">
          <Upload size={22} />
        </div>
        <div className="document-drop-copy">
          <h3>{busy ? 'Đang đưa văn thư vào hầm ngọc trai…' : 'Kéo thả tệp vào lưới thu thập kho báu'}</h3>
          <p>Hỗ trợ toàn bộ tài liệu PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Ảnh và Tệp văn bản.</p>
        </div>
        <label className="btn ocean-btn document-pick" htmlFor="document-picker">
          <Upload size={16} /> Chọn Tệp Máy Tính
        </label>
        <input
          ref={inputRef}
          className="visually-hidden"
          id="document-picker"
          type="file"
          accept={ACCEPT}
          multiple
          onChange={onPick}
          disabled={busy}
        />
      </section>

      {notice && (
        <div className={`document-notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </div>
      )}

      {/* Archive Collection Table */}
      <section className="card document-library ocean-card">
        <div className="document-toolbar">
          <div>
            <span className="document-eyebrow navy">
              <FolderOpen size={15} /> KHO VĂN THƯ
            </span>
            <h3>Tài liệu của bạn</h3>
            <p className="muted">Toàn bộ tệp nằm trong cơ sở dữ liệu IndexedDB trình duyệt của bạn.</p>
          </div>
          <label className="document-search ocean-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm tài liệu…"
              aria-label="Tìm tài liệu"
            />
          </label>
        </div>

        <div className="chips document-filters" role="group" aria-label="Lọc tài liệu">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`chip ocean-chip ${filter === item.id ? 'on' : ''}`}
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="document-empty">
            <span className="document-empty-icon">
              <FolderOpen size={25} />
            </span>
            <strong>Đang mở hầm kho báu…</strong>
          </div>
        ) : visibleDocuments.length ? (
          <div className="document-list">
            {visibleDocuments.map((item) => {
              const category = categoryFor(item.name);
              return (
                <article className="document-row ocean-document-row" key={item.id}>
                  <div className={`document-file-icon ${category}`}>{fileIcon(category)}</div>
                  <div className="document-file-info">
                    <strong title={item.name}>{item.name}</strong>
                    <span>
                      {CATEGORY_LABEL[category]} <i /> {formatBytes(item.size)} <i /> {formatDate(item.addedAt)}
                    </span>
                  </div>
                  <div className="document-actions">
                    <button
                      className="btn sm ghost document-ai-btn ocean-ai-btn"
                      onClick={() => setSelectedForAi(item)}
                      aria-label={`Hỏi đáp AI với ${item.name}`}
                      title="Hỏi đáp AI & Tạo Flashcards"
                    >
                      <Sparkles size={14} />
                      <span className="document-ai-btn-text">Hỏi đáp AI</span>
                    </button>
                    <button
                      className="icon-btn document-download"
                      onClick={() => void download(item)}
                      aria-label={`Tải xuống ${item.name}`}
                      title="Tải xuống"
                    >
                      <Download size={17} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => void remove(item)}
                      aria-label={`Xóa ${item.name}`}
                      title="Xóa"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="document-empty">
            <span className="document-empty-icon">
              <FolderOpen size={25} />
            </span>
            <strong>
              {search || filter !== 'all' ? 'Không tìm thấy văn thư phù hợp' : 'Hầm kho báu đang trống'}
            </strong>
            <span>
              {search || filter !== 'all'
                ? 'Thử từ khóa khác hoặc chọn danh mục khác.'
                : 'Thả văn thư đầu tiên vào để bắt đầu lưu trữ.'}
            </span>
          </div>
        )}
      </section>

      <p className="document-privacy">
        <ShieldCheck size={14} /> Văn thư được mã hóa lưu trữ cục bộ trong IndexedDB của bạn, an toàn tuyệt đối.
      </p>

      {/* Drawer Hỏi đáp AI */}
      {selectedForAi && (
        <DocumentAiDrawer
          item={selectedForAi}
          onClose={() => setSelectedForAi(null)}
          onDeckCreated={(_deck) => {
            if (onNavigate) {
              onNavigate('flashcards');
            }
          }}
        />
      )}
    </div>
  );
}

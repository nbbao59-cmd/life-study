import { ExternalLink, Headphones, Play, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';
import { RELAX_LABEL } from '../../data/options';
import { RelaxItem, RelaxKind } from '../../types';
import { safeHttpUrl, uid } from '../../utils/helpers';
import { isYouTubeHost, parseYouTubeId, youtubeEmbed, youtubeThumb } from '../../utils/youtube';

interface Props {
  items: RelaxItem[];
  setItems: React.Dispatch<React.SetStateAction<RelaxItem[]>>;
}

const EMOJI: Record<RelaxKind, string> = { youtube: '▶️', podcast: '🎙️', book: '📖', hobby: '🎨' };

export default function RelaxationZone({ items, setItems }: Props) {
  const [kind, setKind] = useState<RelaxKind>('youtube');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);

  const videos = items.filter((i) => i.kind === 'youtube');
  const others = items.filter((i) => i.kind !== 'youtube');

  const add = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Hãy nhập tiêu đề.');
    let finalUrl: string | undefined;
    if (url.trim()) {
      const safe = safeHttpUrl(url);
      if (!safe) return setError('Liên kết không hợp lệ (cần bắt đầu bằng http:// hoặc https://).');
      if (kind === 'youtube' && !isYouTubeHost(safe)) return setError('Hãy dán liên kết YouTube (youtube.com hoặc youtu.be).');
      finalUrl = safe;
    } else if (kind === 'youtube') {
      return setError('Hãy dán liên kết YouTube.');
    }
    setItems((p) => [...p, { id: uid(), kind, title: title.trim(), url: finalUrl, note: note.trim() || undefined }]);
    setTitle(''); setUrl(''); setNote('');
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <div className="stack">
      <PageTitle icon={<Headphones size={22} />} title="Khu vực thư giãn" subtitle="Góc chill: nhạc YouTube, podcast, sách và sở thích" />

      <div className="card">
        <form className="form" onSubmit={add}>
          <div className="field" style={{ maxWidth: 140 }}>
            <label htmlFor="x-kind">Loại</label>
            <select id="x-kind" value={kind} onChange={(e) => { setKind(e.target.value as RelaxKind); setError(''); }}>
              {(Object.keys(RELAX_LABEL) as RelaxKind[]).map((k) => <option key={k} value={k}>{RELAX_LABEL[k]}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label htmlFor="x-title">Tiêu đề</label><input id="x-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Nhạc lofi học bài" /></div>
          <div className="field" style={{ flex: 3, minWidth: 220 }}>
            <label htmlFor="x-url">{kind === 'youtube' ? 'Link YouTube' : 'Liên kết (không bắt buộc)'}</label>
            <input id="x-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." inputMode="url" />
          </div>
          <div className="field"><label htmlFor="x-note">Ghi chú</label><input id="x-note" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <button className="btn" type="submit"><Plus size={16} /> Thêm</button>
        </form>
        {error && <p className="error" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      <section>
        <h3 style={{ margin: '4px 0 12px', fontSize: 16 }}>▶️ Nhạc & video thư giãn</h3>
        {videos.length === 0 && <div className="empty">Chưa có video nào. Dán link YouTube ở trên để thêm.</div>}
        <div className="yt-grid">
          {videos.map((v) => {
            const id = v.url ? parseYouTubeId(v.url) : null;
            return (
              <article key={v.id} className="yt-card">
                {id && playing === v.id ? (
                  <iframe src={youtubeEmbed(id)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                ) : id ? (
                  <button className="yt-thumb" onClick={() => setPlaying(v.id)} aria-label={`Phát ${v.title}`}>
                    <img src={youtubeThumb(id)} alt="" loading="lazy" />
                    <span className="play"><Play size={24} fill="#fff" /></span>
                  </button>
                ) : (
                  <a className="yt-thumb" href={v.url} target="_blank" rel="noopener noreferrer" aria-label={`Mở ${v.title} trên YouTube`}>
                    <span className="play"><ExternalLink size={22} /></span>
                  </a>
                )}
                <div className="yt-body">
                  <h4>{v.title}</h4>
                  {v.note && <span className="muted">{v.note}</span>}
                  <div className="row">
                    {v.url && <a className="link" href={v.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Mở trên YouTube</a>}
                    <span className="spacer" />
                    <button className="icon-btn danger" onClick={() => remove(v.id)} aria-label="Xóa"><Trash2 size={16} /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h3 style={{ margin: '4px 0 12px', fontSize: 16 }}>🌿 Podcast, sách & sở thích</h3>
        {others.length === 0 && <div className="empty">Chưa có mục nào.</div>}
        <div className="stack" style={{ gap: 10 }}>
          {others.map((o) => (
            <div key={o.id} className="relax-item">
              <span style={{ fontSize: 22 }}>{EMOJI[o.kind]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="task-title">{o.title}</div>
                <div className="muted">{o.note}</div>
              </div>
              <span className="badge">{RELAX_LABEL[o.kind]}</span>
              {o.url && <a className="icon-btn" href={o.url} target="_blank" rel="noopener noreferrer" aria-label="Mở liên kết"><ExternalLink size={16} /></a>}
              <button className="icon-btn danger" onClick={() => remove(o.id)} aria-label="Xóa"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

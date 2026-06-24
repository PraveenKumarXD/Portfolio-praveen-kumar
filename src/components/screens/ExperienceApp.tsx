import { timeline } from '../../data/portfolio';

interface Props {
  appAnim: string;
  onGoHome: () => void;
}

export default function ExperienceApp({ appAnim, onGoHome }: Props) {
  return (
    <div style={{ height: '100%', animation: appAnim, transformOrigin: '50% 30%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 14px', position: 'relative', borderBottom: '1px solid #eef0f3' }}>
        <button
          onClick={onGoHome}
          style={{ position: 'absolute', left: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#1d1d1f', display: 'flex', padding: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>Journey</span>
      </div>

      <div style={{ padding: '26px 22px' }}>
        {timeline.map((job) => (
          <div key={job.title} style={{ display: 'flex', gap: 13, marginBottom: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: job.dot, marginTop: 3 }} />
              <span style={{ width: 2, flex: 1, background: '#ececed', marginTop: 4 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.05em', color: '#9a9aa0', textTransform: 'uppercase' }}>
                {job.period}
              </div>
              <div style={{ fontSize: 15, fontWeight: 650, marginTop: 3, lineHeight: 1.25 }}>
                {job.title}
              </div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 12, color: '#9a9aa0', textAlign: 'center', lineHeight: 1.5, marginTop: 6 }}>
          Full timeline shown<br />beside the device →
        </div>
      </div>
    </div>
  );
}

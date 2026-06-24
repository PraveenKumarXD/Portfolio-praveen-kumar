import { skillGroups, highlights, currentFocus, GITHUB_URL } from '../../data/portfolio';
import type { AppScreen } from '../../types';

interface Props {
  screen: AppScreen;
  panelAnim: string;
  onOpen: (screen: AppScreen) => void;
}

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
  </svg>
);

export default function RightPanel({ screen, panelAnim, onOpen }: Props) {
  if (!screen) {
    return (
      <div style={{ animation: 'pf-panel .65s cubic-bezier(.4,0,.2,1) both', animationDelay: '.08s' }}>
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b', marginBottom: 20 }}>EXPLORE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: 'About',    key: 'about'      },
            { label: 'Journey',  key: 'experience' },
            { label: 'Projects', key: 'projects'   },
          ].map(({ label, key }) => (
            <div
              key={key}
              onClick={() => onOpen(key as AppScreen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 4px', borderBottom: '1px solid #efeff1', cursor: 'pointer', transition: 'padding-left .3s ease' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.paddingLeft = '12px')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.paddingLeft = '4px')}
            >
              <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>{label}</span>
              <ChevronRight />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#86868b', fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759' }} />
          Open to opportunities
        </div>
      </div>
    );
  }

  if (screen === 'about') {
    let delay = 0;
    return (
      <div style={{ animation: panelAnim }}>
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b', marginBottom: 18 }}>SKILLS &amp; TOOLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {skillGroups.map((group) => (
            <div key={group.label}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: '#1d1d1f', textTransform: 'uppercase', marginBottom: 10 }}>
                {group.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.items.map((item) => {
                  delay += 40;
                  return (
                    <span
                      key={item}
                      style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', background: '#f5f5f7', border: '1px solid #ececee', padding: '7px 13px', borderRadius: 24, animation: 'pf-chip .5s cubic-bezier(.34,1.3,.5,1) both', animationDelay: `${delay}ms` }}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'experience') {
    return (
      <div style={{ animation: panelAnim }}>
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b', marginBottom: 18 }}>HIGHLIGHTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {highlights.map((hl) => (
            <div key={hl.stat} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', animation: 'pf-chip .5s cubic-bezier(.34,1.3,.5,1) both', animationDelay: hl.d }}>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.03em', color: '#1d1d1f', minWidth: 54 }}>{hl.stat}</span>
              <span style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.45, paddingTop: 3 }}>{hl.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b', marginBottom: 16 }}>VISION</div>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#515154', maxWidth: '34ch' }}>
            The next generation of software will be driven by <strong style={{ color: '#1d1d1f', fontWeight: 600 }}>intent rather than code</strong> — systems that understand requirements, reason through solutions, and execute reliably.
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'projects') {
    return (
      <div style={{ animation: panelAnim }}>
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b', marginBottom: 18 }}>CURRENT FOCUS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
          {currentFocus.map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'pf-chip .45s cubic-bezier(.34,1.3,.5,1) both', animationDelay: `${i * 60 + 80}ms` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1d1d1f', flex: 'none' }} />
              <span style={{ fontSize: 15, fontWeight: 500, color: '#1d1d1f' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ececee', borderRadius: 20, padding: 24, background: '#fff' }}>
          <div style={{ fontSize: 18, fontWeight: 680, letterSpacing: '-.01em' }}>Find me on GitHub</div>
          <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.55, marginTop: 8 }}>
            Agentic systems, AI testing experiments and automation tooling — all open source.
          </p>
          <a
            href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#1d1d1f', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '11px 17px', borderRadius: 12, marginTop: 18, transition: 'transform .25s cubic-bezier(.3,1,.4,1),box-shadow .25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 22px -10px rgba(0,0,0,.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            @Prav3in <ExternalLink />
          </a>
        </div>
      </div>
    );
  }

  return null;
}

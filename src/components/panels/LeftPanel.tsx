import { timeline, projects } from '../../data/portfolio';
import type { AppScreen } from '../../types';

interface Props {
  screen: AppScreen;
  panelAnim: string;
  onGoHome: () => void;
}

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
  </svg>
);

export default function LeftPanel({ screen, panelAnim, onGoHome }: Props) {
  if (!screen) {
    return (
      <div style={{ animation: 'pf-panel .65s cubic-bezier(.4,0,.2,1) both' }}>
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b' }}>
          AI ENGINEER · AGENTIC SYSTEMS BUILDER
        </div>
        <h1 style={{ fontSize: 'clamp(40px,5.4vw,60px)', lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 680, marginTop: 18, color: '#1d1d1f' }}>
          Praveen<br />Kumar
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: '#6e6e73', marginTop: 22, maxWidth: '30ch' }}>
          I build AI-powered systems that transform human intent into executable workflows.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 30, color: '#86868b', fontSize: 14, fontWeight: 500 }}>
          <span style={{ width: 26, height: 1, background: '#d2d2d7', display: 'inline-block' }} />
          Select an app on the device
        </div>
      </div>
    );
  }

  if (screen === 'about') {
    return (
      <div style={{ animation: panelAnim }}>
        <BackButton onClick={onGoHome} />
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b' }}>ABOUT</div>
        <h1 style={{ fontSize: 'clamp(38px,5vw,56px)', lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 680, marginTop: 14 }}>
          Praveen Kumar
        </h1>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: '#1d1d1f' }}>AI Engineer · Agentic Systems Builder</div>
          <div style={{ fontSize: 16, color: '#86868b' }}>Automation Architect</div>
        </div>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: '#515154', maxWidth: '44ch' }}>
            I graduated with a degree in <strong style={{ color: '#1d1d1f', fontWeight: 600 }}>Electronics &amp; Communication Engineering</strong>, with major and minor projects focused on Artificial Intelligence.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: '#515154', maxWidth: '44ch' }}>
            After entering software I built automation frameworks and CI/CD systems. Over time my focus shifted from automating tests to <strong style={{ color: '#1d1d1f', fontWeight: 600 }}>automating workflows themselves</strong> — leading me into LLMs, agentic systems, and AI product development.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: '#515154', maxWidth: '44ch' }}>
            Today my goal is to build intelligent systems that can <strong style={{ color: '#1d1d1f', fontWeight: 600 }}>understand, reason, and execute</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'experience') {
    return (
      <div style={{ animation: panelAnim }}>
        <BackButton onClick={onGoHome} />
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b' }}>JOURNEY</div>
        <h1 style={{ fontSize: 'clamp(34px,4.4vw,48px)', lineHeight: 1.04, letterSpacing: '-.03em', fontWeight: 680, marginTop: 14, marginBottom: 30 }}>
          Automation → AI
        </h1>
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          <div style={{
            position: 'absolute', left: 5, top: 6, bottom: 6, width: 2,
            background: '#e3e3e6', transformOrigin: 'top',
            animation: 'pf-line .9s cubic-bezier(.4,0,.2,1) both',
            animationDelay: '.1s',
          }} />
          {timeline.map((job) => (
            <div key={job.title} style={{
              position: 'relative', marginBottom: 30,
              animation: 'pf-card .6s cubic-bezier(.4,0,.2,1) both',
              animationDelay: job.d,
            }}>
              <div style={{
                position: 'absolute', left: -30, top: 4, width: 12, height: 12,
                borderRadius: '50%', background: job.dot,
                boxShadow: '0 0 0 4px #ffffff,0 0 0 5px #e3e3e6',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.04em', color: '#86868b', textTransform: 'uppercase' }}>
                  {job.period}
                </span>
                {job.current && (
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#fff', background: '#1d1d1f', padding: '3px 8px', borderRadius: 20 }}>
                    CURRENT
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 650, letterSpacing: '-.01em', marginTop: 8, color: '#1d1d1f' }}>
                {job.title}
              </h3>
              <ul style={{ listStyle: 'none', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {job.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, color: '#515154' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c7c7cc', flex: 'none' }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'projects') {
    const aiProjects = projects.filter(p => p.category === 'ai');
    const engProjects = projects.filter(p => p.category === 'engineering');

    return (
      <div style={{ animation: panelAnim }}>
        <BackButton onClick={onGoHome} />
        <div style={{ fontSize: 12, letterSpacing: '.22em', fontWeight: 600, color: '#86868b' }}>PROJECTS</div>
        <h1 style={{ fontSize: 'clamp(34px,4.4vw,48px)', lineHeight: 1.04, letterSpacing: '-.03em', fontWeight: 680, marginTop: 14, marginBottom: 26 }}>
          Selected work
        </h1>

        <SectionLabel>AI Projects</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
          {aiProjects.map(proj => <ProjectCard key={proj.name} proj={proj} />)}
        </div>

        <SectionLabel>Engineering Projects</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {engProjects.map(proj => <ProjectCard key={proj.name} proj={proj} />)}
        </div>
      </div>
    );
  }

  return null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#86868b', textTransform: 'uppercase', marginBottom: 14 }}>
      {children}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.color = '#1d1d1f')}
      onMouseLeave={e => (e.currentTarget.style.color = '#86868b')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#86868b', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: 0, marginBottom: 24, transition: 'color .2s' }}
    >
      ← Home
    </button>
  );
}

function ProjectCard({ proj }: { proj: typeof projects[0] }) {
  return (
    <div
      style={{
        border: proj.featured ? '1.5px solid #1d1d1f' : '1px solid #ececee',
        borderRadius: 20, overflow: 'hidden', background: '#fff',
        transition: 'transform .35s cubic-bezier(.3,1,.4,1),box-shadow .35s ease',
        animation: 'pf-card .6s cubic-bezier(.4,0,.2,1) both',
        animationDelay: proj.d,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 18px 40px -18px rgba(0,0,0,.22)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {proj.featured && (
        <div style={{ padding: '7px 22px', background: '#1d1d1f', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: '#fff' }}>FEATURED PROJECT</span>
        </div>
      )}
      <div style={{ height: 128, background: 'repeating-linear-gradient(45deg,#f4f4f6,#f4f4f6 11px,#ececed 11px,#ececed 22px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12, color: '#a1a1a6', letterSpacing: '.02em' }}>
          {proj.img}
        </span>
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        <h3 style={{ fontSize: 20, fontWeight: 680, letterSpacing: '-.01em', color: '#1d1d1f' }}>{proj.name}</h3>
        <div style={{ fontSize: 12, color: '#86868b', fontWeight: 500, marginTop: 3 }}>{proj.tag}</div>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: '#6e6e73', marginTop: 10 }}>{proj.desc}</p>
        <ul style={{ listStyle: 'none', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {proj.features.map((feat) => (
            <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: '#515154' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c7c7cc', flex: 'none' }} />
              {feat}
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
          {proj.tech.map((tch) => (
            <span key={tch} style={{ fontSize: 12, fontWeight: 600, color: '#515154', background: '#f3f3f5', border: '1px solid #ececee', padding: '5px 11px', borderRadius: 20 }}>
              {tch}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <a
            href={proj.github} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#1d1d1f', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '10px 16px', borderRadius: 12, transition: 'transform .25s cubic-bezier(.3,1,.4,1),box-shadow .25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 22px -10px rgba(0,0,0,.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            GitHub <ArrowRight />
          </a>
          <a
            href={proj.demo} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', color: '#1d1d1f', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '10px 16px', borderRadius: 12, border: '1px solid #d2d2d7', transition: 'transform .25s cubic-bezier(.3,1,.4,1),border-color .25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#1d1d1f'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#d2d2d7'; }}
          >
            Demo <ArrowRight />
          </a>
        </div>
      </div>
    </div>
  );
}

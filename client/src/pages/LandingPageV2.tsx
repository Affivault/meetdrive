import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  .ss-rev {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1);
  }
  .ss-rev.on { opacity: 1; transform: translateY(0); }
  .ss-rev.d1 { transition-delay: .08s; }
  .ss-rev.d2 { transition-delay: .16s; }
  .ss-rev.d3 { transition-delay: .24s; }
  .ss-rev.d4 { transition-delay: .32s; }
  .ss-rev.d5 { transition-delay: .40s; }
  .ss-rev.d6 { transition-delay: .48s; }

  @keyframes ss-blob  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(55px,-40px) scale(1.09)} 66%{transform:translate(-30px,55px) scale(0.93)} }
  @keyframes ss-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-16px)} }
  @keyframes ss-f2    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }
  @keyframes ss-f3    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
  @keyframes ss-logos { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes ss-in    { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ss-ping  { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(2.4);opacity:0} }
  @keyframes ss-count { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ss-spin  { to{transform:rotate(360deg)} }
  @keyframes ss-bar   { from{width:0} to{width:var(--w)} }

  .ss-btn-p {
    display:inline-flex; align-items:center; gap:8px; text-decoration:none;
    background:linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%);
    color:#fff; border:none; padding:13px 26px; border-radius:11px;
    font-size:15px; font-weight:600; cursor:pointer; letter-spacing:-.025em;
    box-shadow:0 4px 22px rgba(124,58,237,.38),inset 0 1px 0 rgba(255,255,255,.13);
    transition:all .2s cubic-bezier(.16,1,.3,1);
  }
  .ss-btn-p:hover { transform:translateY(-2px); box-shadow:0 10px 38px rgba(124,58,237,.52),inset 0 1px 0 rgba(255,255,255,.13); }

  .ss-btn-g {
    display:inline-flex; align-items:center; gap:8px; text-decoration:none;
    background:transparent; color:rgba(248,250,252,.62);
    border:1px solid rgba(255,255,255,.1); padding:13px 22px;
    border-radius:11px; font-size:15px; font-weight:500; cursor:pointer;
    transition:all .2s;
  }
  .ss-btn-g:hover { border-color:rgba(167,139,250,.4); color:#F8FAFC; background:rgba(124,58,237,.08); }

  .ss-fc {
    background:rgba(255,255,255,.028); border:1px solid rgba(255,255,255,.065);
    border-radius:16px; padding:28px; transition:all .25s ease;
  }
  .ss-fc:hover { background:rgba(124,58,237,.06); border-color:rgba(124,58,237,.28); transform:translateY(-3px); }

  .ss-tc {
    background:rgba(255,255,255,.026); border:1px solid rgba(255,255,255,.065);
    border-radius:18px; padding:32px; transition:border-color .25s;
  }
  .ss-tc:hover { border-color:rgba(124,58,237,.22); }

  .ss-nav-link { color:rgba(248,250,252,.48); font-size:13.5px; font-weight:500;
    text-decoration:none; letter-spacing:-.02em; transition:color .15s; }
  .ss-nav-link:hover { color:#F8FAFC; }

  .ss-foot-link { font-size:13.5px; color:rgba(248,250,252,.36); text-decoration:none;
    letter-spacing:-.01em; transition:color .15s; }
  .ss-foot-link:hover { color:#F8FAFC; }

  @media(max-width:940px) {
    .ss-hg  { grid-template-columns:1fr!important; }
    .ss-mw  { display:none!important; }
    .ss-h1  { font-size:50px!important; }
    .ss-fg  { grid-template-columns:1fr 1fr!important; }
    .ss-sg  { grid-template-columns:1fr 1fr!important; }
    .ss-tg  { grid-template-columns:1fr!important; }
    .ss-ftg { grid-template-columns:1fr 1fr!important; }
  }
  @media(max-width:600px) {
    .ss-h1  { font-size:38px!important; }
    .ss-fg  { grid-template-columns:1fr!important; }
    .ss-ftg { grid-template-columns:1fr!important; }
    .ss-nav-links { display:none!important; }
  }
`;

/* ─── Logo ────────────────────────────────────────────────────────────────── */
function SsLogo({ size = 1 }: { size?: number }) {
  const s = size;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 * s, userSelect: 'none' }}>
      {/* Mark: dark violet square with upward-send arrow icon */}
      <div style={{
        width: 32 * s, height: 32 * s, borderRadius: 8 * s, flexShrink: 0,
        background: 'linear-gradient(145deg,#2e1065,#1a0e3d)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 0 0 1.5px rgba(124,58,237,.52),0 0 22px rgba(124,58,237,.2),inset 0 1px 0 rgba(255,255,255,.1)`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,rgba(124,58,237,.65) 0%,rgba(52,211,153,.25) 100%)',
        }} />
        <svg
          width={15 * s} height={15 * s} viewBox="0 0 15 15" fill="none"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Arrow shaft pointing up-right */}
          <path d="M3 12L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Arrowhead */}
          <path d="M6 3H12V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Origin dot (emerald) */}
          <circle cx="3" cy="12" r="1.6" fill="rgba(52,211,153,.9)" />
        </svg>
      </div>

      {/* Wordmark */}
      <span style={{ fontSize: 16.5 * s, fontWeight: 700, letterSpacing: '-.04em', fontFamily: 'inherit' }}>
        <span style={{ color: '#F8FAFC' }}>Sky</span>
        <span style={{
          background: 'linear-gradient(90deg,#A78BFA 0%,#34D399 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Send</span>
      </span>
    </div>
  );
}

/* ─── Hero product mockup ─────────────────────────────────────────────────── */
function HeroMockup() {
  const rows = [
    { name: 'Q4 Enterprise Push',   live: true,  rate: 0.47, col: '#A78BFA' },
    { name: 'SaaS Cold Sequence v3', live: true,  rate: 0.81, col: '#34D399' },
    { name: 'Re-engagement Oct',    live: false, rate: 0.31, col: '#F59E0B' },
  ];
  return (
    <div style={{
      background: 'rgba(10,7,22,.96)',
      border: '1px solid rgba(124,58,237,.2)',
      borderRadius: 18,
      padding: 22,
      width: 410,
      boxShadow: '0 40px 90px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04),inset 0 1px 0 rgba(255,255,255,.06)',
    }}>
      {/* Traffic-light titlebar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'rgba(255,255,255,.28)' }}>SKYSEND</span>
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: 'rgba(124,58,237,.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5H7.5M4.5 1.5L7.5 4.5L4.5 7.5" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Campaign rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.055)',
            borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: r.live ? r.col : 'rgba(255,255,255,.15)',
              boxShadow: r.live ? `0 0 8px ${r.col}88` : undefined,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <div style={{ flex: 1, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                  <div style={{ width: `${r.rate * 100}%`, height: '100%', background: r.col, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.34)', flexShrink: 0 }}>{Math.round(r.rate * 100)}% open</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div style={{
        marginTop: 14, padding: '11px 12px',
        background: 'rgba(255,255,255,.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,.05)',
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', letterSpacing: '.06em', marginBottom: 8 }}>ACTIVITY · LAST 7 DAYS</div>
        <svg width="100%" height="38" viewBox="0 0 360 38" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ssChartG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity=".38" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,36 C30,32 55,28 90,22 C120,16 140,26 170,18 C200,10 220,8 255,6 C280,4 315,5 360,2 L360,38 L0,38 Z" fill="url(#ssChartG)" />
          <path d="M0,36 C30,32 55,28 90,22 C120,16 140,26 170,18 C200,10 220,8 255,6 C280,4 315,5 360,2" fill="none" stroke="#A78BFA" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export function LandingPageV2() {
  const [sent, setSent] = useState(1_849_321);

  useEffect(() => {
    const t = setInterval(() => setSent(n => n + Math.floor(Math.random() * 3 + 1)), 2100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.ss-rev');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('on'); }),
      { threshold: 0.1 },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const features = [
    { icon: '⟳', title: 'Smart Sequences',        desc: 'Multi-touch campaigns that adapt in real time based on how each lead engages. Stop sending into the void.', col: '#A78BFA' },
    { icon: '◎', title: 'Inbox-First Delivery',   desc: '98.7% inbox placement. Warm-up automation, domain health checks, and bounce protection — all built in.', col: '#34D399' },
    { icon: '✦', title: 'AI Personalization',     desc: 'Generate opening lines, icebreakers, and entire sequences tailored to every prospect in seconds.', col: '#F59E0B' },
    { icon: '↗', title: 'Real-Time Analytics',    desc: 'See opens, clicks, and replies as they happen. Know exactly what\'s working and double down on it.', col: '#EC4899' },
    { icon: '⊞', title: 'Team Collaboration',     desc: 'Shared inboxes, campaign templates, and reply ownership. No lead ever slips through the cracks.', col: '#06B6D4' },
    { icon: '⚡', title: 'Native CRM Sync',        desc: 'Bi-directional sync with HubSpot, Salesforce, and Pipedrive. Your pipeline stays current, always.', col: '#7C3AED' },
  ];

  const stats = [
    { val: '10M+',    label: 'Emails sent monthly' },
    { val: '98.7%',   label: 'Inbox delivery rate' },
    { val: '3.2×',    label: 'Higher reply rate vs industry avg' },
    { val: '< 2 min', label: 'Average time to first send' },
  ];

  const testimonials = [
    {
      quote: '"We went from a 2% reply rate to 14% in under six weeks. Nothing else comes even close."',
      name: 'Sarah Chen', role: 'Head of Sales · Acme Corp',
      av: '#7C3AED', metric: '+600%', metricLabel: 'reply rate lift',
    },
    {
      quote: '"The deliverability alone justifies the cost. Our entire outbound pipeline runs through SkySend now."',
      name: 'Marcus Reid', role: 'Founder · TechFlow',
      av: '#34D399', metric: '98.7%', metricLabel: 'inbox rate',
    },
    {
      quote: '"Finally an outreach tool our reps actually want to use. The UI is miles ahead of everything else."',
      name: 'Priya Nair', role: 'VP Sales · Growthly',
      av: '#EC4899', metric: '3×', metricLabel: 'pipeline growth',
    },
  ];

  const logos = ['Salesforce', 'HubSpot', 'Pipedrive', 'Notion', 'Stripe', 'Intercom', 'Zendesk', 'Linear', 'Loom', 'Figma'];

  const avColors = ['#7C3AED', '#34D399', '#F59E0B', '#EC4899', '#06B6D4'];
  const avLetters = ['S', 'M', 'J', 'A', 'R'];

  /* ── render ── */
  return (
    <div style={{ background: '#07070F', color: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden', fontFamily: `-apple-system,'Inter','SF Pro Display','Segoe UI',sans-serif` }}>
      <style>{CSS}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(7,7,15,.82)', backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <SsLogo size={1} />
          <div className="ss-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {['Features', 'Pricing', 'Customers', 'Docs'].map(item => (
              <a key={item} href="#" className="ss-nav-link">{item}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login"  className="ss-btn-g" style={{ padding: '7px 18px', fontSize: 13.5 }}>Sign in</Link>
            <Link to="/signup" className="ss-btn-p" style={{ padding: '8px 20px', fontSize: 13.5 }}>Get started →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 148, paddingBottom: 110, position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* BG blobs */}
        {[
          { w:820,h:820, top:-260, left:-320, bg:'rgba(124,58,237,.21)', dur:'20s', del:'0s' },
          { w:600,h:600, top:'auto',left:'auto',  bottom:-120, right:-160, bg:'rgba(52,211,153,.13)', dur:'24s', del:'7s' },
          { w:450,h:450, top:'28%', left:'38%', bg:'rgba(217,70,239,.07)', dur:'17s', del:'3s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', width: b.w, height: b.h, borderRadius: '50%', pointerEvents: 'none',
            top: b.top as any, left: b.left as any, bottom: (b as any).bottom, right: (b as any).right,
            background: `radial-gradient(circle,${b.bg} 0%,transparent 65%)`,
            animation: `ss-blob ${b.dur} ease-in-out infinite ${b.del}`,
          }} />
        ))}

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div className="ss-hg" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

            {/* Left copy */}
            <div style={{ animation: 'ss-in .85s cubic-bezier(.16,1,.3,1) both' }}>
              {/* Eyebrow pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 30 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(52,211,153,.09)', border: '1px solid rgba(52,211,153,.24)',
                  borderRadius: 100, padding: '5px 13px 5px 8px',
                }}>
                  <div style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399' }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#34D399', animation: 'ss-ping 2.6s cubic-bezier(0,0,.2,1) infinite' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6EE7B7', letterSpacing: '.01em' }}>10,000+ teams sending smarter</span>
                </div>
              </div>

              {/* H1 */}
              <h1 className="ss-h1" style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.01, letterSpacing: '-.04em', marginBottom: 24, color: '#F8FAFC' }}>
                Cold outreach<br />
                <span style={{
                  background: 'linear-gradient(135deg,#A78BFA 0%,#7C3AED 35%,#34D399 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>that actually closes.</span>
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(248,250,252,.56)', maxWidth: 440, marginBottom: 36, letterSpacing: '-.01em' }}>
                Automate multi-touch sequences, land in every inbox, and turn cold contacts into warm conversations — at scale.
              </p>

              {/* CTA row */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 44, flexWrap: 'wrap' }}>
                <Link to="/signup" className="ss-btn-p">Start free — no card required</Link>
                <a href="#demo" className="ss-btn-g">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
                  </svg>
                  See it in action
                </a>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex' }}>
                  {avColors.map((c, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(145deg,${c},${c}88)`,
                      border: '2px solid #07070F', marginLeft: i > 0 ? -10 : 0, zIndex: 5 - i,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>{avLetters[i]}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(248,250,252,.62)', letterSpacing: '-.02em' }}>
                  <strong style={{ color: '#F8FAFC' }}>★ 4.9</strong>{' '}from 2,400+ reviews
                </div>
              </div>
            </div>

            {/* Right: floating mockup */}
            <div className="ss-mw" style={{ position: 'relative', display: 'flex', justifyContent: 'center', animation: 'ss-float 7s ease-in-out infinite' }}>
              <div style={{ transform: 'perspective(1200px) rotateX(4deg) rotateY(-7deg)' }}>
                <HeroMockup />
              </div>

              {/* Float: reply received */}
              <div style={{
                position: 'absolute', top: -30, right: -18,
                background: 'rgba(10,6,25,.93)', border: '1px solid rgba(52,211,153,.3)',
                borderRadius: 13, padding: '11px 15px', backdropFilter: 'blur(16px)',
                boxShadow: '0 18px 42px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04)',
                animation: 'ss-f2 5.5s ease-in-out infinite 1s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 10px #34D399' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.88)' }}>Reply from Alex Chen</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 3 }}>"We'd love to hop on a call..."</div>
              </div>

              {/* Float: deliverability */}
              <div style={{
                position: 'absolute', bottom: 8, left: -38,
                background: 'linear-gradient(135deg,rgba(124,58,237,.18),rgba(52,211,153,.12))',
                border: '1px solid rgba(124,58,237,.3)', borderRadius: 13,
                padding: '13px 18px', backdropFilter: 'blur(16px)',
                boxShadow: '0 18px 42px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04)',
                animation: 'ss-float 8s ease-in-out infinite 2s',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.05em', color: '#F8FAFC', lineHeight: 1 }}>98.7%</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.44)', marginTop: 3, letterSpacing: '.06em' }}>INBOX DELIVERY</div>
              </div>

              {/* Float: sent counter */}
              <div style={{
                position: 'absolute', top: '42%', right: -52,
                background: 'rgba(10,6,25,.9)', border: '1px solid rgba(255,255,255,.09)',
                borderRadius: 11, padding: '9px 13px', backdropFilter: 'blur(12px)',
                animation: 'ss-f3 6s ease-in-out infinite 3s',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.34)', letterSpacing: '.06em', marginBottom: 2 }}>EMAILS SENT TODAY</div>
                <div key={sent} style={{ fontSize: 16, fontWeight: 700, color: '#A78BFA', letterSpacing: '-.03em', animation: 'ss-count .3s ease both' }}>
                  {sent.toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LOGO STRIP ──────────────────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '18px 0', overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,.012)',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, zIndex: 1, background: 'linear-gradient(to right,#07070F,transparent)' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, zIndex: 1, background: 'linear-gradient(to left,#07070F,transparent)' }} />
        <div style={{ display: 'flex', animation: 'ss-logos 28s linear infinite', width: 'max-content' }}>
          {[...logos, ...logos].map((name, i) => (
            <div key={i} style={{
              padding: '0 38px', display: 'flex', alignItems: 'center',
              fontSize: 13, fontWeight: 600, letterSpacing: '-.03em', color: 'rgba(248,250,252,.2)', whiteSpace: 'nowrap',
            }}>{name}</div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="ss-rev" style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
            background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)',
            borderRadius: 100, padding: '4px 14px',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#A78BFA', letterSpacing: '.04em' }}>HOW IT WORKS</span>
          </div>
          <h2 style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-.035em', color: '#F8FAFC', lineHeight: 1.1, marginBottom: 14 }}>
            From zero to pipeline<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in three steps.
            </span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, position: 'relative' }}>
          {/* connector lines */}
          <div style={{ position: 'absolute', top: 36, left: '16.5%', right: '16.5%', height: 1, background: 'linear-gradient(90deg,rgba(124,58,237,.3),rgba(52,211,153,.3))', zIndex: 0 }} />

          {[
            { num: '01', title: 'Import your contacts', desc: 'Upload a CSV or sync directly from your CRM. SkySend cleanses, deduplicates, and scores every contact automatically.' },
            { num: '02', title: 'Build your sequence',  desc: 'Use the drag-and-drop sequence builder or let AI draft your entire campaign — subject lines, body copy, follow-ups and all.' },
            { num: '03', title: 'Watch replies come in', desc: 'Campaigns run on autopilot. Your unified inbox surfaces hot leads, so you spend time on conversations, not clicking send.' },
          ].map((step, i) => (
            <div key={i} className={`ss-rev d${i + 1}`} style={{ textAlign: 'center', padding: '0 28px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 24px',
                background: i === 1
                  ? 'linear-gradient(135deg,#7C3AED,#34D399)'
                  : 'rgba(255,255,255,.05)',
                border: i === 1 ? 'none' : '1px solid rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: i === 1 ? '0 8px 32px rgba(124,58,237,.4)' : undefined,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: i === 1 ? '#fff' : 'rgba(248,250,252,.5)', letterSpacing: '-.02em' }}>{step.num}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-.03em', marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(248,250,252,.5)', lineHeight: 1.68, letterSpacing: '-.01em' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="ss-rev" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
            background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)',
            borderRadius: 100, padding: '4px 14px',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#A78BFA', letterSpacing: '.04em' }}>FEATURES</span>
          </div>
          <h2 style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-.035em', color: '#F8FAFC', lineHeight: 1.1, marginBottom: 14 }}>
            Everything you need.<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nothing you don't.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(248,250,252,.48)', maxWidth: 460, margin: '0 auto', lineHeight: 1.65, letterSpacing: '-.01em' }}>
            Every feature is built with one goal: getting your emails read, replied to, and closed.
          </p>
        </div>

        <div className="ss-fg" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} className={`ss-rev ss-fc d${(i % 5) + 1}`}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, marginBottom: 18,
                background: `${f.col}18`, border: `1px solid ${f.col}2e`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 21, color: f.col,
              }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-.03em', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(248,250,252,.48)', lineHeight: 1.65, letterSpacing: '-.01em' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,rgba(124,58,237,.06) 0%,rgba(52,211,153,.04) 100%)',
        borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="ss-sg" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40 }}>
            {stats.map((s, i) => (
              <div key={i} className={`ss-rev d${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.1,
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg,#A78BFA,#7C3AED)'
                    : 'linear-gradient(135deg,#34D399,#06B6D4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{s.val}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(248,250,252,.44)', marginTop: 8, letterSpacing: '-.01em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="ss-rev">
          <div style={{ width: 3, height: 48, background: 'linear-gradient(to bottom,#7C3AED,#34D399)', borderRadius: 4, margin: '0 auto 32px' }} />
          <blockquote style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.5, letterSpacing: '-.025em', color: 'rgba(248,250,252,.82)', marginBottom: 28, fontStyle: 'italic' }}>
            "SkySend is the first tool that treats deliverability and personalisation as a single problem. It's in a completely different league."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(145deg,#7C3AED,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>D</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC', letterSpacing: '-.02em' }}>Daniel Torres</div>
              <div style={{ fontSize: 12.5, color: 'rgba(248,250,252,.38)' }}>CRO · Momentum Labs</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="ss-rev" style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.035em', color: '#F8FAFC', lineHeight: 1.12, marginBottom: 12 }}>
            Loved by sales teams<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>around the world.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(248,250,252,.44)', letterSpacing: '-.01em' }}>Real teams. Real numbers. No cherry-picked demos.</p>
        </div>

        <div className="ss-tg" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} className={`ss-rev ss-tc d${i + 1}`}>
              <div style={{
                display: 'inline-flex', flexDirection: 'column', marginBottom: 22,
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.18)',
              }}>
                <span style={{
                  fontSize: 28, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1,
                  background: 'linear-gradient(135deg,#A78BFA,#34D399)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{t.metric}</span>
                <span style={{ fontSize: 10.5, color: 'rgba(248,250,252,.38)', letterSpacing: '.04em', marginTop: 4 }}>{t.metricLabel.toUpperCase()}</span>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(248,250,252,.7)', marginBottom: 24, letterSpacing: '-.01em' }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(145deg,${t.av},${t.av}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff',
                }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(248,250,252,.88)', letterSpacing: '-.02em' }}>{t.name}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(248,250,252,.36)', letterSpacing: '-.01em' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px 120px', position: 'relative' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="ss-rev" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.035em', color: '#F8FAFC', lineHeight: 1.12 }}>Simple, transparent pricing.</h2>
            <p style={{ fontSize: 16, color: 'rgba(248,250,252,.44)', marginTop: 12, letterSpacing: '-.01em' }}>One plan. Everything included. No per-seat shock.</p>
          </div>

          <div className="ss-rev d1" style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(124,58,237,.32)',
            borderRadius: 22, padding: 40, position: 'relative', overflow: 'hidden',
            boxShadow: '0 0 90px rgba(124,58,237,.14)',
          }}>
            {/* Glow cap */}
            <div style={{
              position: 'absolute', top: -90, left: '50%', transform: 'translateX(-50%)',
              width: 340, height: 220, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(ellipse,rgba(124,58,237,.32) 0%,transparent 70%)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 22,
                background: 'rgba(52,211,153,.11)', border: '1px solid rgba(52,211,153,.28)',
                borderRadius: 100, padding: '4px 12px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6EE7B7', letterSpacing: '.04em' }}>MOST POPULAR</span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 58, fontWeight: 800, letterSpacing: '-.04em', color: '#F8FAFC', lineHeight: 1 }}>£299</span>
                <span style={{ fontSize: 16, color: 'rgba(248,250,252,.38)', letterSpacing: '-.02em' }}>/month</span>
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(248,250,252,.38)', marginBottom: 32, letterSpacing: '-.01em' }}>Or £999 lifetime — pay once, own it forever.</div>

              {[
                'Unlimited campaigns & sequences',
                'Up to 10,000 contacts',
                '5 SMTP accounts + automated warm-up',
                'AI personalization (1,000 credits/mo)',
                'Analytics, A/B testing & team seats',
                'Priority support & onboarding call',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(52,211,153,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5.5L4 7.5L8 3" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(248,250,252,.74)', letterSpacing: '-.01em' }}>{item}</span>
                </div>
              ))}

              <Link to="/signup" className="ss-btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 26, padding: '14px 28px', fontSize: 15.5 }}>
                Start free 14-day trial →
              </Link>
              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: 'rgba(248,250,252,.28)', letterSpacing: '-.01em' }}>
                No credit card required · Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,.06)',
        background: 'linear-gradient(135deg,rgba(124,58,237,.08) 0%,rgba(52,211,153,.05) 50%,transparent 100%)',
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(248,250,252,.045) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 30%,transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 30%,transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 300, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse,rgba(124,58,237,.28) 0%,transparent 70%)',
        }} />

        <div className="ss-rev" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-.04em', color: '#F8FAFC', lineHeight: 1.07, marginBottom: 18 }}>
            Ready to fill your<br />
            <span style={{ background: 'linear-gradient(135deg,#A78BFA 0%,#7C3AED 40%,#34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>pipeline?</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(248,250,252,.5)', marginBottom: 36, lineHeight: 1.65, letterSpacing: '-.01em' }}>
            Join 10,000+ sales teams already using SkySend to scale their outreach without scaling their headcount.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="ss-btn-p" style={{ padding: '14px 32px', fontSize: 16 }}>Get started free</Link>
            <Link to="/login"  className="ss-btn-g" style={{ padding: '14px 28px', fontSize: 16 }}>Sign in →</Link>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(248,250,252,.26)', letterSpacing: '-.01em' }}>
            Free 14-day trial · No credit card · Full access from day one
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '52px 24px', color: 'rgba(248,250,252,.34)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="ss-ftg" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 44 }}>
            <div>
              <div style={{ marginBottom: 14 }}><SsLogo size={.95} /></div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, maxWidth: 230, letterSpacing: '-.01em' }}>
                The modern cold outreach platform built for sales teams who care about results.
              </p>
            </div>
            {[
              { title: 'Product',   links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Resources', links: ['Docs', 'Blog', 'Templates', 'Guides'] },
              { title: 'Company',   links: ['About', 'Customers', 'Privacy', 'Terms'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', color: 'rgba(248,250,252,.48)', marginBottom: 16 }}>{col.title.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.links.map(link => <a key={link} href="#" className="ss-foot-link">{link}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, letterSpacing: '-.01em' }}>© 2025 SkySend. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" style={{ fontSize: 12.5, color: 'rgba(248,250,252,.28)', textDecoration: 'none', letterSpacing: '-.01em' }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

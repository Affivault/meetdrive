import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Check, Zap, Sparkles, Shield, BarChart3, Mail, Users,
  TrendingUp, Star, ChevronRight, Play, MousePointerClick, MessageSquare,
  CalendarCheck, BadgeCheck, Inbox,
} from 'lucide-react';

/* ─── Keyframes ──────────────────────────────────────────────────── */
const CSS = `
  @keyframes bz-float  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(.4deg)} }
  @keyframes bz-float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes bz-float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes bz-glow   { 0%,100%{box-shadow:0 0 30px rgba(249,115,22,.2),0 20px 60px rgba(0,0,0,.5)} 50%{box-shadow:0 0 60px rgba(249,115,22,.35),0 20px 60px rgba(0,0,0,.5)} }
  @keyframes bz-logos  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes bz-in     { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes bz-ping   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.5} }
  @keyframes bz-spin   { to{transform:rotate(360deg)} }
  @keyframes bz-width  { from{width:0} to{width:var(--w)} }
  @keyframes bz-count  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .bz-rev { opacity:0; transform:translateY(28px); transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
  .bz-rev.on { opacity:1; transform:translateY(0); }
  .bz-cta:hover  { filter:brightness(1.08); transform:translateY(-2px); box-shadow:0 0 48px rgba(249,115,22,.55)!important; }
  .bz-ghost:hover{ background:rgba(255,255,255,.08)!important; }
  .bz-nl:hover   { color:rgba(255,255,255,.85)!important; }
  .bz-card-hover:hover { border-color:rgba(249,115,22,.25)!important; transform:translateY(-2px); }
`;

/* ─── Brand ─────────────────────────────────────────────────────── */
function BlazeLogo({ scale = 1 }: { scale?: number }) {
  const s = scale;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 * s, userSelect: 'none' }}>
      <div style={{
        width: 34 * s, height: 34 * s, borderRadius: 9 * s, flexShrink: 0,
        background: 'linear-gradient(145deg,#F97316,#FB923C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 ${18 * s}px rgba(249,115,22,.55), 0 ${4 * s}px ${12 * s}px rgba(249,115,22,.3)`,
      }}>
        <svg width={15 * s} height={17 * s} viewBox="0 0 15 17" fill="none">
          <path d="M9 1L1.5 9.5H7.5L6 16L13.5 7.5H7.5L9 1Z" fill="white" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{
        fontSize: 19 * s, fontWeight: 900, letterSpacing: '-0.045em',
        background: 'linear-gradient(135deg,#fff 40%,rgba(255,255,255,.75) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>blaze</span>
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────── */
const LOGOS = ['Stripe','Vercel','Linear','Figma','Notion','Loom','Intercom','Arc',
               'Stripe','Vercel','Linear','Figma','Notion','Loom','Intercom','Arc'];

const STATS = [
  { n: '10M+',  l: 'emails sent',     s: 'monthly' },
  { n: '98.7%', l: 'inbox placement', s: 'guaranteed' },
  { n: '3.2×',  l: 'reply rate lift', s: 'vs competitors' },
  { n: '<2min', l: 'setup time',      s: 'first campaign live' },
];

const HOW = [
  { n:'01', icon: Users,         title: 'Import your list',       body: 'Upload a CSV or sync from your CRM. Blaze scores every address for deliverability before the first send.' },
  { n:'02', icon: Zap,           title: 'Build your sequence',    body: 'Drag-and-drop multi-step flows with AI-written steps, conditional branching, and smart send-time windows.' },
  { n:'03', icon: CalendarCheck, title: 'Watch meetings appear',  body: 'Blaze handles sending, tracking, and reply triage. You just show up to calls.' },
];

const FEATURES = [
  {
    icon: Mail, color: '#F97316', bg: 'rgba(249,115,22,.1)', border: 'rgba(249,115,22,.2)',
    tag: 'Sequences',
    title: 'Campaigns that adapt in real-time',
    body: 'Multi-step sequences with AI send-time optimisation, unlimited steps, and conditional branching based on opens, clicks, and replies.',
    tags: ['AI send windows','Conditional logic','Unlimited steps','A/B testing'],
    wide: true,
  },
  {
    icon: Shield, color: '#22D3EE', bg: 'rgba(6,182,212,.1)', border: 'rgba(6,182,212,.2)',
    tag: 'Deliverability',
    title: 'Primary inbox, every time',
    body: 'Automated warmup, real-time spam monitoring, and domain health scoring built in from day one.',
  },
  {
    icon: Sparkles, color: '#A78BFA', bg: 'rgba(139,92,246,.1)', border: 'rgba(139,92,246,.2)',
    tag: 'AI Assist',
    title: 'Replies drafted in seconds',
    body: 'Blaze classifies every reply by intent and drafts context-aware responses. One click to send.',
  },
  {
    icon: BarChart3, color: '#34D399', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.2)',
    tag: 'Analytics',
    title: 'Full-funnel in one view',
    body: 'Every open, click, reply, and bounce across all campaigns. Exportable. Real-time.',
  },
  {
    icon: Users, color: '#FBBF24', bg: 'rgba(251,191,36,.1)', border: 'rgba(251,191,36,.2)',
    tag: 'Team',
    title: 'Built for whole teams',
    body: 'Shared workspaces, role-based permissions, and team templates. Invite in seconds.',
  },
];

const REVIEWS = [
  { m: '$40K', ml: 'saved / year',   i: 'DK', a: 'David Kim',      r: 'CRO, Meridian',
    q: 'We replaced three tools with Blaze. Saved $40K annually while improving every single metric across the board.' },
  { m: '12×',  ml: 'faster triage',  i: 'EP', a: 'Emily Park',     r: 'Director of Marketing, ScaleUp',
    q: 'AI Assist handles all our reply triage. What used to take 3 hours now takes 15 minutes — with better accuracy.' },
  { m: '98.7%',ml: 'delivered',      i: 'MJ', a: 'Marcus Johnson', r: 'VP Sales, GrowthLabs',
    q: 'Deliverability went from 89% to 98.7% in under two weeks. Our meeting rate followed immediately.' },
];

const FEATURES_LIST = [
  'Unlimited campaigns & sequences','AI send-time optimisation',
  'AI Assist (inbox reply drafting)','Deliverability engine & warmup',
  'Real-time analytics & CSV export','A/B testing — subjects & body',
  'Custom domain & DKIM setup','Team workspaces & roles',
  'All future updates, forever','Priority support',
];

const BAR = [34,48,44,62,58,74,68,84,79,91,86,94,88,97];

/* ─── Helpers ────────────────────────────────────────────────────── */
const W: React.CSSProperties = { maxWidth: 1160, margin: '0 auto', padding: '0 28px' };

const GRAD: React.CSSProperties = {
  background: 'linear-gradient(135deg,#F97316 0%,#FBBF24 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
};

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color, background:bg, border:`1px solid ${border}`, borderRadius:7, padding:'3px 9px' }}>
      {children}
    </span>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('on'); }),
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    ref.current?.querySelectorAll('.bz-rev').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ═══════════════════════════════════════════════════════════════════ */
export function LandingPageV2() {
  const page = useReveal();
  const [sent, setSent] = useState(5276);

  useEffect(() => {
    const t = setInterval(() => setSent((p) => p + Math.floor(Math.random() * 3) + 1), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div ref={page} style={{ background:'#07060C', color:'#fff', fontFamily:'Inter,system-ui,-apple-system,sans-serif', overflowX:'hidden', lineHeight:1 }}>
      <style>{CSS}</style>

      {/* ══════════════ NAV ════════════════════════════════════════ */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, zIndex:200, height:62,
        display:'flex', alignItems:'center',
        background:'rgba(7,6,12,.88)', backdropFilter:'blur(24px) saturate(1.6)',
        borderBottom:'1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ ...W, width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/lp2" style={{ textDecoration:'none' }}><BlazeLogo /></Link>

          <nav style={{ display:'flex', gap:28 }}>
            {['Features','How it works','Pricing','Reviews'].map((n) => (
              <a key={n} href={`#bz-${n.toLowerCase().replace(/ /g,'-')}`} className="bz-nl"
                style={{ fontSize:13.5, fontWeight:500, color:'rgba(255,255,255,.5)', textDecoration:'none', transition:'color .2s' }}>
                {n}
              </a>
            ))}
          </nav>

          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <Link to="/login" style={{ fontSize:13.5, fontWeight:500, color:'rgba(255,255,255,.6)', textDecoration:'none' }}>Log in</Link>
            <Link to="/signup" className="bz-cta" style={{
              display:'inline-flex', alignItems:'center', gap:7,
              background:'linear-gradient(135deg,#F97316,#FBBF24)',
              color:'#0A0600', fontSize:13.5, fontWeight:800,
              padding:'9px 20px', borderRadius:9, textDecoration:'none',
              boxShadow:'0 0 24px rgba(249,115,22,.4)', transition:'filter .2s,transform .2s,box-shadow .2s',
            }}>Get started free <ArrowRight size={13} /></Link>
          </div>
        </div>
      </header>

      {/* ══════════════ HERO ═══════════════════════════════════════ */}
      <section style={{ paddingTop:140, paddingBottom:60, position:'relative', overflow:'hidden' }}>
        {/* Glows */}
        <div style={{ position:'absolute', top:-280, left:'50%', transform:'translateX(-55%)', width:1000, height:1000, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(249,115,22,.07) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:60, right:'5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(251,191,36,.05) 0%,transparent 70%)', pointerEvents:'none' }} />
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize:'32px 32px', mask:'radial-gradient(ellipse 80% 60% at 50% 0%,black 0%,transparent 100%)', WebkitMask:'radial-gradient(ellipse 80% 60% at 50% 0%,black 0%,transparent 100%)', pointerEvents:'none' }} />

        <div style={W}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' }}>

            {/* LEFT */}
            <div>
              {/* Pill */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.3)', borderRadius:100, padding:'6px 14px', marginBottom:28 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#F97316', animation:'bz-ping 2s ease infinite' }} />
                <span style={{ fontSize:11.5, fontWeight:700, color:'#FB923C' }}>New</span>
                <span style={{ width:1, height:11, background:'rgba(249,115,22,.4)' }} />
                <span style={{ fontSize:11.5, color:'rgba(255,255,255,.5)' }}>AI Assist now powered by GPT-4o</span>
                <ChevronRight size={12} style={{ color:'#FB923C' }} />
              </div>

              {/* Headline */}
              <h1 style={{ fontSize:'clamp(40px,5vw,68px)', fontWeight:900, lineHeight:1.02, letterSpacing:'-0.035em', marginBottom:22 }}>
                Your unfair<br />
                advantage in<br />
                <span style={GRAD}>cold outreach.</span>
              </h1>

              <p style={{ fontSize:17.5, lineHeight:1.75, color:'rgba(255,255,255,.5)', marginBottom:34, maxWidth:460 }}>
                AI-powered sequences, inbox-guaranteed delivery, and smart reply handling — everything you need to go from cold list to booked calendar.
              </p>

              <div style={{ display:'flex', gap:11, alignItems:'center', marginBottom:22, flexWrap:'wrap' }}>
                <Link to="/signup" className="bz-cta" style={{
                  display:'inline-flex', alignItems:'center', gap:9,
                  background:'linear-gradient(135deg,#F97316,#FBBF24)',
                  color:'#0A0600', fontWeight:800, fontSize:16,
                  padding:'15px 28px', borderRadius:12, textDecoration:'none',
                  boxShadow:'0 0 36px rgba(249,115,22,.4), 0 6px 24px rgba(0,0,0,.5)',
                  transition:'filter .2s,transform .2s,box-shadow .2s',
                }}>Start for free <ArrowRight size={17} /></Link>

                <Link to="/login" className="bz-ghost" style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  color:'rgba(255,255,255,.65)', fontWeight:600, fontSize:15,
                  padding:'15px 22px', borderRadius:12, textDecoration:'none',
                  border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.03)',
                  transition:'background .2s',
                }}><Play size={13} fill="currentColor" />See how it works</Link>
              </div>

              <p style={{ fontSize:12.5, color:'rgba(255,255,255,.28)', marginBottom:18 }}>
                Free 14-day trial · No credit card required · Cancel anytime
              </p>

              {/* Social proof avatars */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ display:'flex' }}>
                  {['#F97316','#FBBF24','#34D399','#818CF8','#F472B6'].map((c,i) => (
                    <div key={i} style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #07060C', background:c, marginLeft: i === 0 ? 0 : -8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#000', flexShrink:0, zIndex: 5 - i }}>
                      {['DK','EP','MJ','SC','AL'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex', gap:1, marginBottom:2 }}>
                    {[...Array(5)].map((_,i) => <Star key={i} size={11} fill="#FBBF24" stroke="none" />)}
                  </div>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}><strong style={{ color:'#fff' }}>500+ teams</strong> hitting quota with Blaze</span>
                </div>
              </div>
            </div>

            {/* RIGHT — floating card cluster */}
            <div style={{ position:'relative', height:440 }}>

              {/* Main dashboard card */}
              <div style={{
                position:'absolute', top:20, left:20, right:0,
                borderRadius:18, overflow:'hidden',
                border:'1px solid rgba(255,255,255,.09)',
                animation:'bz-float 5s ease-in-out infinite, bz-glow 5s ease-in-out infinite',
              }}>
                {/* Chrome */}
                <div style={{ background:'rgba(255,255,255,.05)', padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {['#FF5F57','#FEBC2E','#28C840'].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }} />)}
                  </div>
                  <div style={{ flex:1, textAlign:'center', fontSize:10.5, color:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.05)', borderRadius:5, padding:'3px 0' }}>app.useblaze.io/campaigns</div>
                  <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:9.5, fontWeight:700, color:'#34D399', background:'rgba(52,211,153,.1)', padding:'2px 7px', borderRadius:4 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'#34D399' }} />LIVE
                  </div>
                </div>

                {/* KPI strip */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,.04)' }}>
                  {[
                    { l:'Sent',     v:'5,276', d:'+12%', c:'#F97316' },
                    { l:'Opens',    v:'72.4%', d:'+8%',  c:'#FBBF24' },
                    { l:'Replies',  v:'28.4%', d:'+19%', c:'#34D399' },
                    { l:'Booked',   v:'143',   d:'+31%', c:'#A78BFA' },
                  ].map((k,i) => (
                    <div key={i} style={{ padding:'12px 14px', background:'#0E0C16' }}>
                      <div style={{ fontSize:9.5, color:'rgba(255,255,255,.35)', marginBottom:4, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{k.l}</div>
                      <div style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 }}>{k.v}</div>
                      <div style={{ fontSize:9.5, color:k.c, marginTop:3, fontWeight:700 }}>{k.d}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div style={{ padding:'14px', background:'#0E0C16', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>REPLY RATE — 14 DAYS</div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:52 }}>
                    {BAR.map((h,i) => (
                      <div key={i} style={{
                        flex:1, borderRadius:'3px 3px 0 0',
                        background: i >= 10 ? 'linear-gradient(180deg,#F97316,#FBBF24)' : 'rgba(249,115,22,.2)',
                        height:`${h}%`,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Campaign rows */}
                <div style={{ padding:'10px 14px', background:'#0E0C16' }}>
                  {[
                    { n:'Q4 Outreach — Series A', open:'67%', rep:'18%', hi:false },
                    { n:'Enterprise Demos',        open:'81%', rep:'32%', hi:true  },
                    { n:'Partnership Outreach',    open:'72%', rep:'22%', hi:false },
                  ].map((row,i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, marginBottom:3,
                      background: row.hi ? 'rgba(249,115,22,.08)' : 'transparent',
                      border: row.hi ? '1px solid rgba(249,115,22,.15)' : '1px solid transparent',
                    }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#34D399', flexShrink:0, animation:'bz-ping 2s ease infinite' }} />
                      <span style={{ fontSize:10.5, color:'rgba(255,255,255,.6)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.n}</span>
                      <span style={{ fontSize:10.5, color:'rgba(255,255,255,.3)', flexShrink:0 }}>{row.open}</span>
                      <span style={{ fontSize:10.5, color:'#F97316', fontWeight:700, flexShrink:0 }}>{row.rep}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating toast — reply */}
              <div style={{
                position:'absolute', top:-14, right:-10, zIndex:20,
                background:'rgba(14,12,22,.92)', border:'1px solid rgba(52,211,153,.3)',
                borderRadius:12, padding:'10px 15px', backdropFilter:'blur(16px)',
                display:'flex', alignItems:'center', gap:10,
                animation:'bz-float2 4.5s ease-in-out infinite, bz-in .5s ease .3s both',
              }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#34D399,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <MessageSquare size={14} color="white" fill="white" />
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#34D399' }}>Reply received</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:1 }}>James D. · Enterprise Demos</div>
                </div>
              </div>

              {/* Floating counter */}
              <div style={{
                position:'absolute', bottom:0, left:0, zIndex:20,
                background:'rgba(14,12,22,.92)', border:'1px solid rgba(249,115,22,.28)',
                borderRadius:12, padding:'12px 17px', backdropFilter:'blur(16px)',
                animation:'bz-float3 5.5s ease-in-out infinite, bz-in .5s ease .8s both',
              }}>
                <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.03em', color:'#F97316', lineHeight:1, animation:'bz-count .4s ease' }} key={sent}>{sent.toLocaleString()}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:3 }}>emails sent today</div>
              </div>

              {/* Floating deliverability badge */}
              <div style={{
                position:'absolute', bottom:80, right:-18, zIndex:20,
                background:'rgba(14,12,22,.92)', border:'1px solid rgba(139,92,246,.25)',
                borderRadius:12, padding:'10px 15px', backdropFilter:'blur(16px)',
                animation:'bz-float2 6s ease-in-out 1s infinite, bz-in .5s ease 1.2s both',
                display:'flex', alignItems:'center', gap:9,
              }}>
                <BadgeCheck size={20} style={{ color:'#A78BFA', flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:14, fontWeight:900, color:'#A78BFA', lineHeight:1 }}>98.7%</div>
                  <div style={{ fontSize:9.5, color:'rgba(255,255,255,.38)', marginTop:2 }}>Inbox placement</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ LOGO STRIP ═════════════════════════════════ */}
      <div style={{ padding:'22px 0', borderTop:'1px solid rgba(255,255,255,.05)', borderBottom:'1px solid rgba(255,255,255,.05)', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:140, zIndex:2, background:'linear-gradient(90deg,#07060C,transparent)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:140, zIndex:2, background:'linear-gradient(270deg,#07060C,transparent)', pointerEvents:'none' }} />
        <p style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'rgba(255,255,255,.22)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>Trusted by teams at</p>
        <div style={{ display:'flex', gap:60, animation:'bz-logos 24s linear infinite', width:'max-content' }}>
          {LOGOS.map((n,i) => <span key={i} style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,.16)', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{n}</span>)}
        </div>
      </div>

      {/* ══════════════ STATS ══════════════════════════════════════ */}
      <section style={{ padding:'80px 28px' }}>
        <div style={{ ...W, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {STATS.map((s,i) => (
            <div key={i} className="bz-rev" style={{ padding:'28px 24px', borderRadius:16, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', textAlign:'center', transitionDelay:`${i*.08}s` }}>
              <div style={{ fontSize:46, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:8, ...GRAD }}>{s.n}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,.8)', marginBottom:4 }}>{s.l}</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.3)' }}>{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES BENTO ═════════════════════════════ */}
      <section id="bz-features" style={{ padding:'0 28px 80px' }}>
        <div style={W}>
          <div className="bz-rev" style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:11.5, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>What blaze does</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.08, marginBottom:14 }}>
              Everything you need.<br />
              <span style={GRAD}>Nothing you don't.</span>
            </h2>
            <p style={{ fontSize:17, color:'rgba(255,255,255,.45)', maxWidth:460, margin:'0 auto', lineHeight:1.7 }}>
              From the first send to the signed contract — one platform, zero bloat.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {/* Wide card */}
            <div className="bz-rev bz-card-hover" style={{
              gridColumn:'span 2', padding:'32px', borderRadius:20,
              background:'linear-gradient(135deg,rgba(249,115,22,.1) 0%,rgba(251,191,36,.05) 100%)',
              border:'1px solid rgba(249,115,22,.18)',
              position:'relative', overflow:'hidden',
              transition:'border-color .25s, transform .25s',
            }}>
              <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(249,115,22,.12) 0%,transparent 70%)', pointerEvents:'none' }} />
              <Tag color="#F97316" bg="rgba(249,115,22,.1)" border="rgba(249,115,22,.25)">
                <Mail size={10} /> Sequences
              </Tag>
              <h3 style={{ fontSize:23, fontWeight:800, letterSpacing:'-0.025em', margin:'14px 0 10px', lineHeight:1.2 }}>
                Campaigns that adapt in real-time.
              </h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.52)', lineHeight:1.75, maxWidth:420, marginBottom:20 }}>
                Multi-step sequences with AI send-time optimisation, unlimited steps, and conditional branching based on opens, clicks, and replies. Set it once. Let it close.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {['AI send windows','Conditional logic','Unlimited steps','A/B testing','Smart delays'].map((t) => (
                  <span key={t} style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,.5)', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:6, padding:'4px 10px' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Deliverability */}
            <div className="bz-rev bz-card-hover" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', transitionDelay:'.08s', transition:'border-color .25s,transform .25s' }}>
              <Tag color="#22D3EE" bg="rgba(6,182,212,.1)" border="rgba(6,182,212,.22)"><Shield size={10} /> Deliverability</Tag>
              <h3 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', margin:'12px 0 9px', lineHeight:1.25 }}>Primary inbox, every time</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.48)', lineHeight:1.7, marginBottom:18 }}>Automated warmup, real-time spam monitoring, and domain health scoring built in from day one.</p>
              <div style={{ padding:'14px', borderRadius:12, background:'rgba(6,182,212,.07)', border:'1px solid rgba(6,182,212,.14)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:32, fontWeight:900, color:'#22D3EE', lineHeight:1 }}>98.7%</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.36)', lineHeight:1.5 }}>avg inbox placement across all accounts</div>
              </div>
            </div>

            {/* AI Assist */}
            <div className="bz-rev bz-card-hover" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', transitionDelay:'.14s', transition:'border-color .25s,transform .25s' }}>
              <Tag color="#A78BFA" bg="rgba(139,92,246,.1)" border="rgba(139,92,246,.22)"><Sparkles size={10} /> AI Assist</Tag>
              <h3 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', margin:'12px 0 9px', lineHeight:1.25 }}>Replies drafted instantly</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.48)', lineHeight:1.7 }}>Blaze detects reply intent and drafts context-aware responses automatically. One click to send. Triage 12× faster.</p>
            </div>

            {/* Analytics */}
            <div className="bz-rev bz-card-hover" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', transitionDelay:'.2s', transition:'border-color .25s,transform .25s' }}>
              <Tag color="#34D399" bg="rgba(52,211,153,.1)" border="rgba(52,211,153,.22)"><BarChart3 size={10} /> Analytics</Tag>
              <h3 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', margin:'12px 0 9px', lineHeight:1.25 }}>Full-funnel in one view</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.48)', lineHeight:1.7 }}>Every open, click, reply, and bounce across all campaigns. Real-time. Exportable to CSV in one click.</p>
            </div>

            {/* Team */}
            <div className="bz-rev bz-card-hover" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', transitionDelay:'.26s', transition:'border-color .25s,transform .25s' }}>
              <div style={{ display:'flex', gap:7, marginBottom:12 }}>
                <Tag color="#FBBF24" bg="rgba(251,191,36,.1)" border="rgba(251,191,36,.22)"><Users size={10} /> Team</Tag>
                <Tag color="#F472B6" bg="rgba(244,114,182,.1)" border="rgba(244,114,182,.2)"><Zap size={10} /> A/B</Tag>
              </div>
              <h3 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 9px', lineHeight:1.25 }}>For teams. Wired to test</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.48)', lineHeight:1.7 }}>Multi-user workspaces with role-based permissions and A/B split tests on subject lines and body copy simultaneously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section id="bz-how-it-works" style={{ padding:'0 28px 80px' }}>
        <div style={W}>
          <div className="bz-rev" style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:11.5, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>Dead simple</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.08 }}>
              Live in <span style={GRAD}>under 2 minutes.</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, position:'relative' }}>
            {/* Connecting line */}
            <div style={{ position:'absolute', top:28, left:'16.6%', right:'16.6%', height:1, background:'linear-gradient(90deg,transparent,rgba(249,115,22,.3),rgba(249,115,22,.3),transparent)', pointerEvents:'none' }} />

            {HOW.map((step, i) => (
              <div key={i} className="bz-rev" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', position:'relative', transitionDelay:`${i*.12}s` }}>
                <div style={{
                  width:48, height:48, borderRadius:14, marginBottom:20,
                  background: i === 1 ? 'linear-gradient(135deg,#F97316,#FBBF24)' : 'rgba(249,115,22,.1)',
                  border: i === 1 ? 'none' : '1px solid rgba(249,115,22,.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: i === 1 ? '0 0 24px rgba(249,115,22,.4)' : 'none',
                }}>
                  <step.icon size={20} style={{ color: i === 1 ? '#0A0600' : '#F97316' }} strokeWidth={2} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.25)', letterSpacing:'0.1em', marginBottom:8 }}>{step.n}</div>
                <h3 style={{ fontSize:19, fontWeight:800, letterSpacing:'-0.02em', marginBottom:10, lineHeight:1.2 }}>{step.title}</h3>
                <p style={{ fontSize:13.5, color:'rgba(255,255,255,.48)', lineHeight:1.75 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BIG QUOTE ══════════════════════════════════ */}
      <section style={{ padding:'80px 28px', background:'linear-gradient(135deg,rgba(249,115,22,.05) 0%,rgba(251,191,36,.03) 100%)', borderTop:'1px solid rgba(255,255,255,.05)', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <div className="bz-rev" style={{ maxWidth:820, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:90, lineHeight:.35, fontFamily:'Georgia,serif', marginBottom:24, ...GRAD }}>"</div>
          <blockquote style={{ fontSize:'clamp(18px,2.4vw,25px)', fontWeight:700, lineHeight:1.55, color:'rgba(255,255,255,.85)', marginBottom:32, letterSpacing:'-0.015em' }}>
            We went from 2% to 12% reply rates in three weeks. The AI-driven send optimisation alone was worth switching everything over.
          </blockquote>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#F97316,#FBBF24)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#0A0600', flexShrink:0 }}>SC</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Sarah Chen</div>
              <div style={{ fontSize:12.5, color:'rgba(255,255,255,.4)', marginTop:1 }}>Head of Sales, TechCorp</div>
            </div>
            <div style={{ marginLeft:16, padding:'9px 18px', borderRadius:11, background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.2)' }}>
              <div style={{ fontSize:24, fontWeight:900, lineHeight:1, ...GRAD }}>6×</div>
              <div style={{ fontSize:10.5, color:'rgba(255,255,255,.38)', marginTop:2 }}>reply rate increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ REVIEWS ════════════════════════════════════ */}
      <section id="bz-reviews" style={{ padding:'80px 28px' }}>
        <div style={W}>
          <h2 className="bz-rev" style={{ fontSize:'clamp(26px,3vw,40px)', fontWeight:900, letterSpacing:'-0.03em', textAlign:'center', marginBottom:48 }}>Real teams. Real results.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {REVIEWS.map((t,i) => (
              <div key={i} className="bz-rev bz-card-hover" style={{ padding:'28px', borderRadius:20, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', transitionDelay:`${i*.09}s`, transition:'border-color .25s,transform .25s' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {[...Array(5)].map((_,j) => <Star key={j} size={13} fill="#FBBF24" stroke="none" />)}
                </div>
                <div style={{ fontSize:40, fontWeight:900, letterSpacing:'-0.025em', lineHeight:1, marginBottom:4, ...GRAD }}>{t.m}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:16, fontWeight:500 }}>{t.ml}</div>
                <div style={{ width:36, height:2, borderRadius:1, background:'linear-gradient(90deg,#F97316,#FBBF24)', marginBottom:16 }} />
                <p style={{ fontSize:14, color:'rgba(255,255,255,.6)', lineHeight:1.72, marginBottom:20 }}>"{t.q}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#F97316,#FBBF24)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#0A0600', flexShrink:0 }}>{t.i}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{t.a}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.38)', marginTop:1 }}>{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRICING ════════════════════════════════════ */}
      <section id="bz-pricing" style={{ padding:'0 28px 80px' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div className="bz-rev" style={{ textAlign:'center', marginBottom:44 }}>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:14 }}>
              One price.{' '}<span style={GRAD}>Yours forever.</span>
            </h2>
            <p style={{ fontSize:17, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>No subscriptions. No per-seat fees. No annual renewals. Pay once.</p>
          </div>

          <div className="bz-rev" style={{
            padding:'40px', borderRadius:24,
            background:'linear-gradient(145deg,rgba(249,115,22,.09) 0%,rgba(251,191,36,.05) 100%)',
            border:'1px solid rgba(249,115,22,.22)',
            boxShadow:'0 0 80px rgba(249,115,22,.08)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-120, right:-120, width:320, height:320, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(249,115,22,.1) 0%,transparent 70%)', pointerEvents:'none' }} />

            <div style={{ display:'inline-flex', alignItems:'center', gap:7, marginBottom:24, background:'rgba(249,115,22,.12)', border:'1px solid rgba(249,115,22,.28)', borderRadius:100, padding:'7px 15px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#F97316', animation:'bz-ping 2s ease infinite' }} />
              <span style={{ fontSize:12, fontWeight:700, color:'#FB923C' }}>One-time payment · Lifetime access</span>
            </div>

            <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:26, fontWeight:700, color:'rgba(255,255,255,.4)', lineHeight:1.55 }}>£</span>
              <span style={{ fontSize:80, fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, ...GRAD }}>299</span>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,.65)' }}>forever</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.28)' }}>one-time · no renewal</div>
              </div>
            </div>

            <p style={{ fontSize:15, color:'rgba(255,255,255,.5)', marginBottom:28, lineHeight:1.7 }}>
              Every feature Blaze offers, permanently unlocked. For your entire team. Today, tomorrow, always.
            </p>

            <Link to="/signup" className="bz-cta" style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              background:'linear-gradient(135deg,#F97316,#FBBF24)',
              color:'#0A0600', fontWeight:800, fontSize:17,
              padding:'17px 32px', borderRadius:13, textDecoration:'none',
              boxShadow:'0 0 36px rgba(249,115,22,.4)', marginBottom:32,
              transition:'filter .2s,transform .2s,box-shadow .2s',
            }}>Get lifetime access <ArrowRight size={18} /></Link>

            <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', paddingTop:28, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
              {FEATURES_LIST.map((f) => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(249,115,22,.15)', border:'1px solid rgba(249,115,22,.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check size={10} style={{ color:'#F97316' }} />
                  </div>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:22, marginTop:26, paddingTop:22, borderTop:'1px solid rgba(255,255,255,.06)', flexWrap:'wrap' }}>
              {[
                { icon: Shield,     text: '30-day money-back guarantee' },
                { icon: Zap,        text: 'Instant access after payment' },
                { icon: TrendingUp, text: 'All future updates included' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(255,255,255,.35)' }}>
                  <Icon size={13} style={{ color:'#F97316' }} />{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════════════════════════ */}
      <section style={{ padding:'100px 28px', position:'relative', overflow:'hidden', borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 70% at 50% 50%,rgba(249,115,22,.07) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.055) 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
        <div className="bz-rev" style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <p style={{ fontSize:11.5, fontWeight:700, color:'#F97316', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:18 }}>Ready to outpace the competition?</p>
          <h2 style={{ fontSize:'clamp(30px,4.5vw,58px)', fontWeight:900, letterSpacing:'-0.035em', lineHeight:1.04, marginBottom:18 }}>
            Start booking more<br />
            <span style={GRAD}>meetings today.</span>
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.45)', marginBottom:36, lineHeight:1.7 }}>
            Join 500+ enterprise sales teams that use Blaze to consistently hit their pipeline goals.
          </p>
          <Link to="/signup" className="bz-cta" style={{
            display:'inline-flex', alignItems:'center', gap:11,
            background:'linear-gradient(135deg,#F97316,#FBBF24)',
            color:'#0A0600', fontWeight:800, fontSize:18,
            padding:'18px 38px', borderRadius:14, textDecoration:'none',
            boxShadow:'0 0 50px rgba(249,115,22,.45), 0 10px 36px rgba(0,0,0,.5)',
            transition:'filter .2s,transform .2s,box-shadow .2s',
          }}>Start your free trial <ArrowRight size={20} /></Link>
          <p style={{ fontSize:12.5, color:'rgba(255,255,255,.25)', marginTop:16 }}>Free 14-day trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ══════════════ FOOTER ═════════════════════════════════════ */}
      <footer style={{ padding:'56px 28px 28px', borderTop:'1px solid rgba(255,255,255,.06)', background:'rgba(0,0,0,.3)' }}>
        <div style={W}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:44, gap:32, flexWrap:'wrap' }}>
            <div style={{ maxWidth:240 }}>
              <BlazeLogo />
              <p style={{ fontSize:13, color:'rgba(255,255,255,.3)', marginTop:14, lineHeight:1.75 }}>
                The AI-powered outreach platform for serious B2B sales teams.
              </p>
            </div>
            <div style={{ display:'flex', gap:56, flexWrap:'wrap' }}>
              {[
                { title:'Product', links:['Features','Pricing','Changelog','Roadmap'] },
                { title:'Company', links:['About','Blog','Careers','Contact'] },
                { title:'Legal',   links:['Privacy','Terms','Security'] },
              ].map((col) => (
                <div key={col.title}>
                  <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>{col.title}</p>
                  <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                    {col.links.map((l) => (
                      <li key={l}><a href="#" className="bz-nl" style={{ fontSize:13, color:'rgba(255,255,255,.38)', textDecoration:'none', transition:'color .2s' }}>{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.18)' }}>© 2024 Blaze. All rights reserved.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.18)' }}>Built for the world's best sales teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

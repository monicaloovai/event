"use client";
/* =====================================================================
   EVENT EXPERIENCE – Cubiqo × MonicaLoov.ai
   Startsidan: app/page.jsx
   Allt finns här: säljsida, QR-kod, live-demo, AI-assistent och formulär.
   ===================================================================== */
import { useEffect, useRef, useState } from "react";
/* ---------- INSTÄLLNINGAR (kan bytas i Vercel → Environment Variables) ---------- */
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mdalpnng";
const EVENT_DEMO_URL = process.env.NEXT_PUBLIC_EVENT_DEMO_URL || "/#demo";
/* ---------- DEMO-INNEHÅLL (ändra texterna här) ---------- */
const DEMO = {
    eventName: "Nordic Business Expo 2026",
    date: "Torsdag 12 november · Monter B:12 · Stockholm",
    company: "Ditt företag",
    about: "Här presenterar utställaren sig själv: vilka ni är, vad ni erbjuder och varför besökaren ska ta nästa steg. Allt anpassas efter ert varumärke, era färger och er logotyp.",
    program: [
        { time: "09:00", title: "Välkommen & frukostmingel", place: "Monter B:12" },
        { time: "10:00", title: "Från monter till mobil", place: "Scen 2" },
        { time: "11:30", title: "Live-demo: AI-video och AI-avatar", place: "Monter B:12" },
        { time: "13:00", title: "Lunch & nätverk", place: "Restaurangen" },
        { time: "14:00", title: "Montern som skapar leads", place: "Scen 2" },
        { time: "16:00", title: "Afterwork i montern", place: "Monter B:12" },
    ],
    offer: {
        title: "Eventerbjudande: 20 % på första AI-videon",
        text: "Gäller för företag som bokar ett uppföljningssamtal under eventet.",
        code: "EVENT20",
    },
    slots: ["10:00–10:20", "11:30–11:50", "14:00–14:20", "Digitalt efter eventet"],
};
const TABS = [
    { id: "program", icon: "🗓", label: "Program" },
    { id: "om", icon: "🏢", label: "Om företaget" },
    { id: "erbjudande", icon: "🎁", label: "Erbjudande" },
    { id: "boka", icon: "📅", label: "Boka" },
    { id: "upload", icon: "📸", label: "Upload" },
    { id: "ai", icon: "✨", label: "AI-assistent" },
];
/* ---------- Hjälpfunktioner ---------- */
async function sendToFormspree(data) {
    try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(data),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
function aiAnswer(q) {
    const t = q.toLowerCase();
    const has = (...w) => w.some((x) => t.includes(x));
    if (has("program", "nu", "nästa", "schema", "när", "tid"))
        return `Nästa punkt: 10:00 – Från monter till mobil (Scen 2).\nSen: 11:30 Live-demo och 14:00 Montern som skapar leads.`;
    if (has("erbjud", "rabatt", "kod", "pris"))
        return `${DEMO.offer.title}.\nKod: ${DEMO.offer.code}. ${DEMO.offer.text}`;
    if (has("boka", "möte", "träff", "demo"))
        return `Boka direkt under fliken Boka. Lediga tider: ${DEMO.slots.join(", ")}.`;
    if (has("var", "hitta", "monter", "plats"))
        return `Du hittar oss i Monter B:12. Välkommen förbi!`;
    if (has("vem", "företag", "om er", "gör ni"))
        return DEMO.about;
    if (has("hej", "hallå", "tja"))
        return "Hej och välkommen! Fråga om program, erbjudanden, bokning eller var vi finns.";
    return "Jag kan svara på frågor om programmet, erbjudanden, bokning och var vi finns. Vill du prata med en människa? Lämna dina uppgifter så återkommer vi.";
}
function QrCode({ url, size = 180 }) {
    const [path, setPath] = useState(null);
    useEffect(() => {
        if (!url)
            return;
        const build = () => {
            if (!window.qrcode)
                return;
            const qr = window.qrcode(0, "M");
            qr.addData(url);
            qr.make();
            const n = qr.getModuleCount();
            let d = "";
            for (let r = 0; r < n; r++)
                for (let c = 0; c < n; c++)
                    if (qr.isDark(r, c))
                        d += `M${c + 2} ${r + 2}h1v1h-1z`;
            setPath({ d, n: n + 4 });
        };
        if (window.qrcode)
            return build();
        const existing = document.getElementById("qr-lib");
        const s = existing ?? document.createElement("script");
        if (!existing) {
            s.id = "qr-lib";
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
            document.head.appendChild(s);
        }
        s.addEventListener("load", build);
        return () => s.removeEventListener("load", build);
    }, [url]);
    return (<div className="ee-qr" style={{ width: size, height: size }}>
      {path ? (<svg viewBox={`0 0 ${path.n} ${path.n}`} shapeRendering="crispEdges" role="img" aria-label="QR-kod till live-demon">
          <rect width={path.n} height={path.n} fill="#fff"/>
          <path d={path.d} fill="#0b0e16"/>
        </svg>) : (<span className="ee-qrLoading">QR-kod laddas…</span>)}
    </div>);
}
/* ---------- Kontaktformulär ---------- */
function LeadForm({ source }) {
    const [status, setStatus] = useState("idle");
    async function onSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setStatus("sending");
        const ok = await sendToFormspree({
            _subject: "Ny lead – Event Experience",
            Källa: source,
            Namn: String(fd.get("name") ?? ""),
            Företag: String(fd.get("company") ?? ""),
            email: String(fd.get("email") ?? ""),
            Telefon: String(fd.get("phone") ?? ""),
            Meddelande: String(fd.get("message") ?? ""),
            "Vill bli kontaktad efter eventet": fd.get("contact_after") ? "Ja" : "Nej",
        });
        setStatus(ok ? "done" : "error");
    }
    if (status === "done")
        return (<div className="ee-done" role="status">
        <span>✓</span>
        <p>Tack! Vi återkommer till dig.</p>
      </div>);
    return (<form className="ee-form" onSubmit={onSubmit}>
      <h3>Vill du veta mer?</h3>
      <label>Namn<input name="name" required autoComplete="name"/></label>
      <label>Företag<input name="company" required autoComplete="organization"/></label>
      <label>E-post<input name="email" type="email" required autoComplete="email"/></label>
      <label>Telefon <em>(frivilligt)</em><input name="phone" type="tel" autoComplete="tel"/></label>
      <label>Meddelande <em>(frivilligt)</em><textarea name="message" rows={3}/></label>
      <label className="ee-check">
        <input name="contact_after" type="checkbox"/>
        <span>Jag vill bli kontaktad efter eventet.</span>
      </label>
      <button className="ee-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Skickar…" : "Skicka"}
      </button>
      {status === "error" && <p className="ee-err">Något gick fel. Försök igen om en stund.</p>}
    </form>);
}
/* ---------- Live-demo (det besökaren ser i mobilen) ---------- */
function LiveDemo() {
    const [tab, setTab] = useState("program");
    const [slot, setSlot] = useState(DEMO.slots[0]);
    const [booked, setBooked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [preview, setPreview] = useState(null);
    const [msgs, setMsgs] = useState([
        { me: false, text: "Hej! Jag är eventets AI-assistent. Vad vill du veta?" },
    ]);
    const [input, setInput] = useState("");
    const chatRef = useRef(null);
    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, [msgs]);
    function ask(q) {
        if (!q.trim())
            return;
        setMsgs((m) => [...m, { me: true, text: q }]);
        setInput("");
        setTimeout(() => setMsgs((m) => [...m, { me: false, text: aiAnswer(q) }]), 400);
    }
    async function book(e) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await sendToFormspree({
            _subject: "Ny bokning – Event Experience demo",
            Tid: slot,
            Namn: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
        });
        setBooked(true);
    }
    return (<div className="ee-app">
      <div className="ee-appTop">
        <span className="ee-dot"/> Cubiqo <b>×</b> MonicaLoov.ai
      </div>
      <div className="ee-appHero">
        <small>{DEMO.date}</small>
        <strong>{DEMO.eventName}</strong>
      </div>

      <div className="ee-tabs" role="tablist">
        {TABS.map((t) => (<button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span>
            {t.label}
          </button>))}
      </div>

      <div className="ee-panel">
        {tab === "program" &&
            DEMO.program.map((p) => (<div key={p.time} className="ee-row">
              <b>{p.time}</b>
              <div>
                {p.title}
                <small>{p.place}</small>
              </div>
            </div>))}

        {tab === "om" && (<>
            <h4>Om {DEMO.company}</h4>
            <p>{DEMO.about}</p>
            <div className="ee-links">
              <span>🌐 Webbplats</span>
              <span>📷 Instagram</span>
              <span>💼 LinkedIn</span>
            </div>
          </>)}

        {tab === "erbjudande" && (<div className="ee-offer">
            <h4>{DEMO.offer.title}</h4>
            <p>{DEMO.offer.text}</p>
            <button className="ee-code" onClick={() => {
                navigator.clipboard?.writeText(DEMO.offer.code).catch(() => { });
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}>
              {DEMO.offer.code}
              <small>{copied ? "Kopierad!" : "Tryck för att kopiera"}</small>
            </button>
            <button className="ee-btn" onClick={() => setTab("boka")}>Boka och använd koden</button>
          </div>)}

        {tab === "boka" &&
            (booked ? (<div className="ee-done">
              <span>✓</span>
              <p>Tack! Vi återkommer till dig.<br /><small>Önskad tid: {slot}</small></p>
            </div>) : (<form className="ee-mini" onSubmit={book}>
              <p>Välj en tid för ett kort möte:</p>
              <div className="ee-slots">
                {DEMO.slots.map((s) => (<button type="button" key={s} className={s === slot ? "on" : ""} onClick={() => setSlot(s)}>
                    {s}
                  </button>))}
              </div>
              <input name="name" placeholder="Namn" required/>
              <input name="email" type="email" placeholder="E-post" required/>
              <button className="ee-btn" type="submit">Boka</button>
            </form>))}

        {tab === "upload" && (<div className="ee-upload">
            <p>Dela dina bilder och filmer från eventet.</p>
            <label className="ee-drop">
              <input type="file" accept="image/*,video/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                    setPreview(URL.createObjectURL(f));
            }}/>
              ＋ Ladda upp bild eller video
            </label>
            {preview && (<>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Din uppladdning"/>
                <small>Tack! I den riktiga versionen hamnar bilden i eventets galleri.</small>
              </>)}
          </div>)}

        {tab === "ai" && (<div className="ee-chat">
            <div className="ee-msgs" ref={chatRef}>
              {msgs.map((m, i) => (<div key={i} className={m.me ? "me" : "bot"}>{m.text}</div>))}
            </div>
            <div className="ee-chips">
              {["Vad händer nu?", "Erbjudanden?", "Hur bokar jag?"].map((c) => (<button key={c} onClick={() => ask(c)}>{c}</button>))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); ask(input); }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Skriv din fråga…"/>
              <button type="submit">Fråga</button>
            </form>
          </div>)}
      </div>

      <div className="ee-appFoot">Digital Experience powered by MonicaLoov.ai</div>
    </div>);
}
/* ---------- SIDAN ---------- */
export default function EventExperiencePage() {
    const [demoUrl, setDemoUrl] = useState("");
    useEffect(() => {
        setDemoUrl(/^https?:\/\//.test(EVENT_DEMO_URL) ? EVENT_DEMO_URL : window.location.origin + EVENT_DEMO_URL);
        if (window.location.hash === "#demo")
            document.getElementById("demo")?.scrollIntoView();
    }, []);
    return (<main className="ee">
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <header className="ee-bar">
        <div className="ee-wrap ee-barIn">
          <a href="#" className="ee-brand"><span className="ee-dot"/> MonicaLoov.ai <i>×</i> Cubiqo</a>
          <a href="#demo" className="ee-btn sm">Testa live-demo</a>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="ee-hero">
        <div className="ee-wrap ee-heroIn">
          <div>
            <p className="ee-eyebrow">MonicaLoov.ai &amp; Cubiqo</p>
            <h1>A physical touchpoint. <span>A complete digital event experience.</span></h1>
            <p className="ee-lead"><b>Allt besökaren behöver. Direkt i mobilen.</b></p>
            <p className="ee-text">
              En fysisk, hållbar och varumärkesanpassad accesspunkt kombineras med en digital eventupplevelse som
              besökaren använder direkt i sin egen mobil.
            </p>
            <ul className="ee-nos">
              <li>Ingen app att ladda ner.</li>
              <li>Ingen extra skärm att installera.</li>
              <li>Ingen komplex hårdvara.</li>
            </ul>
            <div className="ee-actions">
              <a href="#demo" className="ee-btn">Testa live-demo</a>
              <a href="#hur" className="ee-ghost">Se hur det fungerar</a>
            </div>
          </div>
          <div className="ee-qrCard">
            <QrCode url={demoUrl} size={200}/>
            <strong>Skanna och testa själv</strong>
            <small>Öppnas direkt i mobilen</small>
          </div>
        </div>
      </section>

      {/* 2. SÅ FUNGERAR DET */}
      <section className="ee-sec" id="hur">
        <div className="ee-wrap">
          <p className="ee-eyebrow">Så fungerar det</p>
          <h2>Från fysisk närvaro till digital interaktion</h2>
          <p className="ee-text">
            Cubiqo skapar en tydlig fysisk närvaro på plats och blir den naturliga accesspunkten till företagets
            digitala eventupplevelse. Besökaren skannar, öppnar och fortsätter direkt i sin egen mobil.
          </p>
          <ol className="ee-flow">
            {["Upptäck", "Interagera", "Fråga", "Boka", "Följ upp"].map((s, i) => (<li key={s}><span>{i + 1}</span>{s}</li>))}
          </ol>
          <p className="ee-quote">QR-koden är vägen in. Den digitala upplevelsen är själva tjänsten.</p>
        </div>
      </section>

      {/* 3 + 4. BESÖKAREN & KUNDEN */}
      <section className="ee-sec alt">
        <div className="ee-wrap ee-two">
          <div className="ee-card">
            <p className="ee-eyebrow">Vad besökaren kan göra</p>
            <h3>Allt samlat på ett ställe</h3>
            <ul className="ee-list">
              <li>Se eventprogram och information</li>
              <li>Läsa om företaget</li>
              <li>Ta del av erbjudanden</li>
              <li>Boka möte eller konsultation</li>
              <li>Ställa frågor till AI-assistenten</li>
              <li>Ladda upp bilder och video</li>
              <li>Lämna sina kontaktuppgifter</li>
              <li>Besöka webbplats och sociala medier</li>
              <li>Ta nästa steg direkt från mobilen</li>
            </ul>
            <p className="ee-small">Ingen app behövs.</p>
          </div>
          <div className="ee-card">
            <p className="ee-eyebrow">Vad kunden får</p>
            <h3>En upplevelse anpassad för varje event</h3>
            <p className="ee-text">Den digitala eventupplevelsen anpassas efter:</p>
            <div className="ee-tags">
              {["Varumärke", "Färger och logotyp", "Eventets syfte", "Målgrupp", "Erbjudanden", "Innehåll", "Funktioner"].map((t) => (<span key={t}>{t}</span>))}
            </div>
            <p className="ee-text">
              MonicaLoov.ai bygger lösningen så att den känns som en naturlig del av företagets eget varumärke.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FÖRE / UNDER / EFTER */}
      <section className="ee-sec">
        <div className="ee-wrap">
          <p className="ee-eyebrow">Före. Under. Efter.</p>
          <h2>Kontakten slutar inte när besökaren lämnar montern</h2>
          <div className="ee-three">
            <div className="ee-card">
              <h3>Före eventet</h3>
              <p>Upplevelsen byggs och anpassas efter företaget, eventet och målet. Innehåll, design, funktioner och bokningar görs klara inför eventet.</p>
            </div>
            <div className="ee-card">
              <h3>Under eventet</h3>
              <p>Besökaren kan upptäcka, fråga, boka, interagera och ta kontakt direkt i mobilen. Cubiqo fungerar som den fysiska accesspunkten till upplevelsen.</p>
            </div>
            <div className="ee-card">
              <h3>Efter eventet</h3>
              <p>Lösningen fortsätter stödja uppföljning, erbjudanden, bokningar, kontakt, leadbearbetning och framtida event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 + 7. VÄRDE & AI */}
      <section className="ee-sec alt">
        <div className="ee-wrap ee-two">
          <div>
            <p className="ee-eyebrow">Värdet för utställaren</p>
            <h2>Mer värde från varje möte</h2>
            <p className="ee-text">
              Ett event handlar inte bara om hur många som passerar montern. Det handlar om vad som händer när någon stannar.
            </p>
            <ul className="ee-list">
              <li>Skapa mer engagemang</li>
              <li>Samla in leads</li>
              <li>Få fler bokningar</li>
              <li>Ge snabbare svar</li>
              <li>Visa erbjudanden</li>
              <li>Samla bilder och innehåll</li>
              <li>Skapa fortsatt kontakt efter eventet</li>
            </ul>
          </div>
          <div className="ee-card ee-ai">
            <p className="ee-eyebrow">AI-assistenten</p>
            <h3>Svar direkt – även när personalen är upptagen</h3>
            <div className="ee-tags">
              {["Vanliga frågor", "Företagsinformation", "Produkter och tjänster", "Program", "Erbjudanden", "Bokning", "Nästa steg"].map((t) => (<span key={t}>{t}</span>))}
            </div>
            <p className="ee-small">Anpassas efter varje företag och event.</p>
          </div>
        </div>
      </section>

      {/* 8. LIVE-DEMO */}
      <section className="ee-sec" id="demo">
        <div className="ee-wrap ee-demo">
          <div>
            <p className="ee-eyebrow">Live-demo</p>
            <h2>Testa upplevelsen själv</h2>
            <p className="ee-text">
              Klicka runt i mobilen – eller skanna QR-koden och öppna den i din egen telefon. Så här möter besökaren
              ert företag på eventet.
            </p>
            <img src="/bilder/cubiqo.jpg" alt="Cubiqo med QR-kod" style={{ width: "100%", maxWidth: 520, borderRadius: 20, marginTop: 28, display: "block" }} />
          </div>
          <div className="ee-phone">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* 9. ROLLER */}
      <section className="ee-sec alt">
        <div className="ee-wrap">
          <p className="ee-eyebrow">Roller och partnerskap</p>
          <h2>Två delar. En komplett eventupplevelse.</h2>
          <div className="ee-two">
            <div className="ee-card">
              <h3>Cubiqo</h3>
              <p>Den fysiska, hållbara och varumärkesanpassade accesspunkten till den digitala eventupplevelsen.</p>
            </div>
            <div className="ee-card">
              <h3>MonicaLoov.ai</h3>
              <p>Bygger, anpassar och driver den digitala eventupplevelsen.</p>
            </div>
          </div>
          <p className="ee-text">Tillsammans skapas en sammanhängande upplevelse före, under och efter eventet.</p>
        </div>
      </section>

      {/* 10. CTA + FORMULÄR */}
      <section className="ee-sec" id="kontakt">
        <div className="ee-wrap ee-two">
          <div>
            <p className="ee-eyebrow">Nästa steg</p>
            <h2>Gör mer av varje eventbesökare</h2>
            <p className="ee-text">Skapa en eventupplevelse som inte slutar när besökaren lämnar montern.</p>
            <div className="ee-actions">
              <a href="#demo" className="ee-btn">Testa live-demo</a>
              <a href="#formular" className="ee-ghost">Boka en presentation</a>
            </div>
          </div>
          <div id="formular">
            <LeadForm source="Event Experience – säljsida"/>
          </div>
        </div>
      </section>

      <footer className="ee-foot">
        <strong>Digital Event Experience by MonicaLoov.ai</strong>
        <span>In collaboration with Cubiqo</span>
      </footer>
    </main>);
}
/* ---------- DESIGN ---------- */
const CSS = `
.ee{--bg:#070a10;--panel:#0f1420;--line:rgba(255,255,255,.12);--text:#f2efe9;--muted:rgba(255,255,255,.66);
  --g1:#e0b06b;--g2:#b9823d;--gold:#d2a15a;background:var(--bg);color:var(--text);
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.55;overflow-x:hidden}
.ee *{box-sizing:border-box}
.ee a{color:inherit;text-decoration:none}
.ee h1,.ee h2,.ee h3,.ee h4{margin:0;line-height:1.1;text-wrap:balance}
.ee h1{font-size:clamp(34px,6vw,64px);letter-spacing:-.02em}
.ee h1 span{display:block;color:var(--gold)}
.ee h2{font-size:clamp(28px,4vw,42px);letter-spacing:-.01em;margin-bottom:14px}
.ee h3{font-size:21px;margin-bottom:10px}
.ee-wrap{width:min(1120px,100%);margin:0 auto;padding:0 20px}
.ee-eyebrow{margin:0 0 10px;color:var(--g1);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.ee-text{color:var(--muted);font-size:17px;max-width:62ch;margin:0 0 16px}
.ee-small{color:var(--muted);font-size:14px;margin:10px 0 0}
.ee-lead{font-size:21px;margin:18px 0 8px}
.ee-dot{display:inline-block;width:10px;height:10px;border-radius:99px;background:var(--gold);box-shadow:0 0 16px rgba(210,161,90,.6)}

.ee-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:12px 20px;border-radius:14px;border:0;
  background:linear-gradient(180deg,var(--g1),var(--g2));color:#111;font:inherit;font-weight:800;cursor:pointer}
.ee .ee-btn{color:#111}
.ee-btn.sm{min-height:40px;padding:8px 14px;font-size:14px;border-radius:11px}
.ee-btn:disabled{opacity:.6}
.ee-ghost{display:inline-flex;align-items:center;min-height:50px;padding:12px 20px;border-radius:14px;border:1px solid var(--line);font-weight:700}
.ee-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}

.ee-bar{position:sticky;top:0;z-index:20;background:rgba(7,10,16,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.ee-barIn{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;padding-bottom:12px}
.ee-brand{display:flex;align-items:center;gap:9px;font-weight:800}
.ee-brand i{font-style:normal;color:var(--gold)}

.ee-hero{padding:72px 0 64px;background:radial-gradient(900px 520px at 80% 30%,rgba(210,161,90,.16),transparent 60%)}
.ee-heroIn{display:grid;grid-template-columns:1.35fr .65fr;gap:48px;align-items:center}
.ee-nos{list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:6px;font-weight:700}
.ee-nos li::before{content:"✓";color:var(--gold);margin-right:10px}
.ee-qrCard{display:flex;flex-direction:column;align-items:center;gap:8px;padding:22px;border-radius:24px;text-align:center;
  background:var(--panel);border:1px solid rgba(210,161,90,.45);box-shadow:0 0 60px rgba(210,161,90,.14)}
.ee-qrCard strong{font-size:18px;margin-top:8px}
.ee-qrCard small{color:var(--muted)}
.ee-qr{background:#fff;border-radius:14px;overflow:hidden;display:grid;place-items:center;max-width:100%}
.ee-qr svg{width:100%;height:100%;display:block}
.ee-qrLoading{color:#666;font-size:12px}

.ee-sec{padding:80px 0}
.ee-sec.alt{background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,0))}
.ee-flow{list-style:none;padding:0;margin:28px 0;display:flex;flex-wrap:wrap;gap:10px}
.ee-flow li{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:999px;border:1px solid var(--line);background:var(--panel);font-weight:700}
.ee-flow span{display:grid;place-items:center;width:26px;height:26px;border-radius:99px;background:linear-gradient(180deg,var(--g1),var(--g2));color:#111;font-size:13px;font-weight:900}
.ee-quote{font-size:clamp(20px,2.6vw,28px);font-weight:700;margin:0;max-width:30ch}

.ee-two{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.ee-three{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:24px}
.ee-card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:24px;min-width:0}
.ee-card p{color:var(--muted);margin:0}
.ee-ai{border-color:rgba(210,161,90,.45)}
.ee-list{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:8px}
.ee-list li{padding-left:26px;position:relative}
.ee-list li::before{content:"✓";position:absolute;left:0;color:var(--gold);font-weight:900}
.ee-tags{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 16px}
.ee-tags span{padding:7px 12px;border-radius:999px;font-size:14px;background:rgba(210,161,90,.1);border:1px solid rgba(210,161,90,.35);color:var(--g1)}

.ee-demo{display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:center}
.ee-phone{width:380px;max-width:100%;height:740px;padding:14px;border-radius:48px;background:#03050a;border:1px solid rgba(255,255,255,.16);
  box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 70px rgba(210,161,90,.16)}

/* --- appen i telefonen --- */
.ee-app{height:100%;display:flex;flex-direction:column;border-radius:36px;overflow:hidden;background:var(--bg)}
.ee-appTop{display:flex;align-items:center;gap:8px;padding:16px 18px 12px;font-weight:800;font-size:14px;border-bottom:1px solid var(--line)}
.ee-appTop b{color:var(--gold)}
.ee-appHero{padding:16px 18px;background:radial-gradient(400px 200px at 80% 0%,rgba(210,161,90,.22),transparent 70%)}
.ee-appHero small{display:block;color:var(--g1);font-size:11px;font-weight:700}
.ee-appHero strong{display:block;font-size:22px;line-height:1.15;margin-top:4px}
.ee-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 12px 10px}
.ee-tabs button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px;border-radius:12px;border:1px solid var(--line);
  background:var(--panel);color:var(--text);font:inherit;font-size:11.5px;font-weight:700;cursor:pointer}
.ee-tabs button span{font-size:19px;line-height:1}
.ee-tabs button.on{border-color:var(--gold);background:rgba(210,161,90,.14);color:var(--g1)}
.ee-panel{flex:1;overflow-y:auto;padding:6px 16px 14px;font-size:14px}
.ee-panel h4{font-size:17px;margin-bottom:8px}
.ee-panel p{color:var(--muted);margin:0 0 12px}
.ee-row{display:grid;grid-template-columns:52px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.ee-row b{color:var(--g1)}
.ee-row small{display:block;color:var(--muted);font-size:12px}
.ee-links{display:flex;flex-wrap:wrap;gap:8px}
.ee-links span{padding:8px 12px;border-radius:10px;border:1px solid var(--line);font-size:13px}
.ee-offer{padding:16px;border-radius:16px;border:1px solid rgba(210,161,90,.4);background:linear-gradient(160deg,rgba(210,161,90,.16),transparent 70%)}
.ee-offer .ee-btn{width:100%}
.ee-code{display:flex;flex-direction:column;align-items:center;width:100%;margin:4px 0 12px;padding:12px;border-radius:12px;border:1px dashed var(--gold);
  background:rgba(0,0,0,.3);color:var(--g1);font:inherit;font-size:22px;font-weight:900;letter-spacing:3px;cursor:pointer}
.ee-code small{font-size:11px;letter-spacing:0;color:var(--muted);font-weight:400}
.ee-mini{display:flex;flex-direction:column;gap:9px}
.ee-slots{display:flex;flex-wrap:wrap;gap:6px}
.ee-slots button{padding:8px 11px;border-radius:99px;border:1px solid var(--line);background:transparent;color:var(--text);font:inherit;font-size:13px;cursor:pointer}
.ee-slots button.on{border-color:var(--gold);color:var(--g1);background:rgba(210,161,90,.14)}
.ee-mini input,.ee-chat input{padding:12px;border-radius:11px;border:1px solid var(--line);background:#0b0f18;color:#fff;font:inherit;font-size:16px;width:100%;min-width:0}
.ee-upload{display:flex;flex-direction:column;gap:10px}
.ee-upload img{border-radius:12px;max-height:200px;object-fit:cover;width:100%}
.ee-upload small{color:var(--muted)}
.ee-drop{position:relative;display:grid;place-items:center;min-height:90px;border-radius:14px;border:1px dashed var(--gold);color:var(--g1);font-weight:700;cursor:pointer}
.ee-drop input{position:absolute;inset:0;opacity:0;cursor:pointer}
.ee-chat{display:flex;flex-direction:column;gap:8px;height:100%}
.ee-msgs{flex:1;min-height:170px;max-height:290px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
.ee-msgs div{max-width:88%;padding:9px 12px;border-radius:14px;white-space:pre-line}
.ee-msgs .bot{background:rgba(255,255,255,.07);align-self:flex-start}
.ee-msgs .me{background:linear-gradient(180deg,var(--g1),var(--g2));color:#111;align-self:flex-end}
.ee-chips{display:flex;gap:6px;overflow-x:auto}
.ee-chips button{flex:0 0 auto;padding:7px 10px;border-radius:99px;border:1px solid rgba(210,161,90,.45);background:transparent;color:var(--g1);font:inherit;font-size:12px;cursor:pointer}
.ee-chat form{display:flex;gap:6px}
.ee-chat form button{padding:0 14px;border-radius:11px;border:0;background:linear-gradient(180deg,var(--g1),var(--g2));color:#111;font:inherit;font-weight:800;cursor:pointer}
.ee-appFoot{padding:10px;text-align:center;font-size:11px;color:var(--muted);border-top:1px solid var(--line)}

/* --- formulär --- */
.ee-form{display:flex;flex-direction:column;gap:12px;padding:24px;border-radius:20px;background:var(--panel);border:1px solid var(--line)}
.ee-form h3{font-size:24px}
.ee-form label{display:flex;flex-direction:column;gap:6px;font-size:14px;color:rgba(255,255,255,.82)}
.ee-form em{font-style:normal;color:var(--muted);font-size:12px}
.ee-form input,.ee-form textarea{padding:13px 12px;border-radius:12px;border:1px solid var(--line);background:#0b0f18;color:#fff;font:inherit;font-size:16px;width:100%}
.ee-form input:focus,.ee-form textarea:focus{outline:none;border-color:var(--gold)}
.ee-form .ee-check{flex-direction:row;align-items:flex-start;gap:10px;font-size:15px;cursor:pointer}
.ee-check input{width:20px;height:20px;margin:1px 0 0;accent-color:var(--gold);flex:0 0 auto}
.ee-err{color:#ff9b8f;margin:0}
.ee-done{display:flex;align-items:center;gap:14px;padding:22px;border-radius:18px;border:1px solid rgba(210,161,90,.45);background:rgba(210,161,90,.1)}
.ee-done span{display:grid;place-items:center;width:40px;height:40px;flex:0 0 auto;border-radius:99px;background:linear-gradient(180deg,var(--g1),var(--g2));color:#111;font-weight:900;font-size:20px}
.ee-done p{margin:0;font-size:18px;font-weight:700;color:var(--text)}
.ee-done small{font-weight:400;color:var(--muted);font-size:14px}

.ee-foot{display:flex;flex-direction:column;align-items:center;gap:4px;padding:36px 20px;border-top:1px solid var(--line);text-align:center}
.ee-foot span{color:var(--muted);font-size:14px}

.ee a:focus-visible,.ee button:focus-visible{outline:2px solid var(--g1);outline-offset:2px}

@media (max-width:900px){
  .ee-heroIn,.ee-two,.ee-demo{grid-template-columns:1fr}
  .ee-three{grid-template-columns:1fr}
  .ee-qrCard{max-width:320px}
  .ee-phone{margin:0 auto}
  .ee-sec{padding:56px 0}
  .ee-hero{padding:44px 0 48px}
}
@media (max-width:480px){
  .ee-phone{width:100%;height:700px;padding:8px;border-radius:30px}
  .ee-app{border-radius:24px}
  .ee-actions .ee-btn,.ee-actions .ee-ghost{flex:1 1 100%;justify-content:center}
  .ee-brand{font-size:14px}
}
`;

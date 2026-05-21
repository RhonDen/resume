import { useEffect, useMemo, useState } from 'react'
import './App.css'

function useSplineBg() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.async = true
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.94'
    script.dataset.splineViewer = 'true'

    document.head.appendChild(script)

    return () => {
      // Let the browser handle cleanup; repeated loads can be messy.
    }
  }, [])
}


const RESUME_URL = '/resume.pdf'
const BASIC_PRICE = '129'
const PREMIUM_PRICE = '399'

const ACCESS_STORAGE_KEY = 'resume_access_token'

const LOCAL_GIFT_CODES = new Map([
  ['JOKE-RESUME', { tier: 'basic' }],
  ['ACCESS-RESUME-2026', { tier: 'basic' }],
])

function generateToken() {
  return Array.from({ length: 48 }, () => Math.random().toString(36)[2]).join('')
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Request failed')
  return data
}

function AccessBadge({ tier }) {
  const label = tier === 'premium' ? 'Premium' : 'Basic'
  return <span className="badge">Access: {label}</span>
}

function ResumeSection({ accessOk }) {
  if (!accessOk) {
    return (
      <section className="card resumeCard" id="resume">
        <div className="resumeHeader">
          <h2>Resume Locked</h2>
          <p className="resumeContact">
            Complete payment or redeem the gift code to unlock the full resume.
          </p>
        </div>

        <div className="resumeBlock">
          <div className="sectionTitle">Unlock Requirement</div>
          <p className="muted" style={{ marginTop: 0 }}>
            The resume content is blocked until access is granted. Use the payment section above or redeem the one available gift code.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="card resumeCard" id="resume">
      <div className="resumeHeader">
        <h2>Rhon Denver S. Dulay</h2>
        <p className="resumeContact">
          #224 Purok 3 Extension, Happy Hollow, Baguio City • +63 999 704 5304 • captdenver7@gmail.com
        </p>
      </div>

      <div className="resumeBlock">
        <div className="sectionTitle">Education</div>
        <div className="sectionRow">
          <div>
            <div className="itemTitle">Bachelor of Science in Information Technology — Network and Security Track</div>
            <div className="itemSubtitle">University of the Cordilleras, Governor Pack Road, Baguio City</div>
          </div>
          <div className="itemDate">Expected Graduation: September 2026</div>
        </div>
        <div className="sectionRow">
          <div>
            <div className="itemTitle">Senior High School — ABM Strand</div>
            <div className="itemSubtitle">Mil-an National High School, Loakan Proper, Loakan Rd, Baguio City</div>
          </div>
          <div className="itemDate">Graduated: March 2023</div>
        </div>
        <div className="sectionRow">
          <div>
            <div className="itemTitle">Junior High School</div>
            <div className="itemSubtitle">Baguio Higher Christian School Inc, Purok Pidawan, Baguio City</div>
          </div>
          <div className="itemDate">Graduated: April 2017</div>
        </div>
      </div>

      <div className="resumeBlock">
        <div className="sectionTitle">Skills & Qualifications</div>
        <ul className="resumeList">
          <li>Certified CCNAv7: Introduction to Networks (Cisco) — Feb 2025</li>
          <li>Certified freeCodeCamp: JavaScript Algorithms and Data Structures — Dec 2024</li>
          <li>Proficient in React.js, Laravel, HTML, CSS, JavaScript, PHP, Python</li>
          <li>Experienced with PostgreSQL, MySQL, MongoDB</li>
          <li>Skilled in UI/UX tools: Figma, Spline, Wix</li>
          <li>Knowledgeable in API integration and prompt engineering (Deepseek, Blackbox, Claude AI, Grok)</li>
          <li>Familiar with OBS Studio and photo/video editing software</li>
          <li>Strong verbal communication skills</li>
        </ul>
      </div>

      <div className="resumeBlock">
        <div className="sectionTitle">Seminars & Trainings</div>
        <ul className="resumeList">
          <li>Blockchain 101: Concepts, Architecture and Real-World Use — UC, Baguio City (March 12, 2026)</li>
          <li>AI & Machine Learning: Powering Intelligent Systems — UC, Baguio City (March 7, 2026)</li>
          <li>Practical Data Analytics using Python and Data Visualization — UC, Baguio City (March 14, 2026)</li>
          <li>SUI Move In CAMPUS 5 — UC, Baguio City (Oct 23, 2025)</li>
        </ul>
      </div>

      <div className="resumeBlock">
        <div className="sectionTitle">Personal Details</div>
        <div className="resumeList">
          <li>Date of Birth: October 4, 2004</li>
          <li>Age: 21</li>
          <li>Height: 5’10”</li>
          <li>Weight: 70 kg</li>
          <li>Character References: Available upon request</li>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSplineBg()
  const [access, setAccess] = useState({ ok: false, tier: null })

  const [loadingAccess, setLoadingAccess] = useState(true)

  const [giftCode, setGiftCode] = useState('')
  const [giftStatus, setGiftStatus] = useState(null)

  const [gcashTier, setGcashTier] = useState('basic')
  const [gcashStatus, setGcashStatus] = useState(null)
  const [showPayment, setShowPayment] = useState(false)

  const hasToken = useMemo(() => {
    try {
      return Boolean(localStorage.getItem(ACCESS_STORAGE_KEY))
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function verify() {
      const token = localStorage.getItem(ACCESS_STORAGE_KEY)
      if (!token) {
        if (!cancelled) {
          setAccess({ ok: false, tier: null })
          setLoadingAccess(false)
        }
        return
      }

      // Try Netlify function first
      try {
        const data = await postJson('/.netlify/functions/verify-access', { token })
        if (!cancelled) {
          setAccess({ ok: Boolean(data?.ok), tier: data?.tier || null })
          setLoadingAccess(false)
        }
      } catch {
        // Fallback for local dev: trust any stored token
        if (!cancelled) {
          setAccess({ ok: true, tier: 'basic' })
          setLoadingAccess(false)
        }
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [hasToken])

  async function redeemGift() {
    const code = giftCode.trim().toUpperCase()
    setGiftStatus({ kind: 'loading', message: 'Redeeming gift code…' })
    try {
      const data = await postJson('/.netlify/functions/redeem-gift', { code })
      localStorage.setItem(ACCESS_STORAGE_KEY, data.token)
      setGiftStatus({ kind: 'ok', message: `Unlocked: ${data.tier}` })
      setAccess({ ok: true, tier: data.tier })
    } catch {
      // Fallback: check locally for dev mode
      const entry = LOCAL_GIFT_CODES.get(code)
      if (!entry) {
        setGiftStatus({ kind: 'error', message: 'Invalid gift code.' })
        return
      }
      const token = generateToken()
      localStorage.setItem(ACCESS_STORAGE_KEY, token)
      setGiftStatus({ kind: 'ok', message: `Unlocked: ${entry.tier}` })
      setAccess({ ok: true, tier: entry.tier })
    }
  }

  function startGcashPayment() {
    // Open the QR code image in a new tab
    window.open('/QR.jpg', '_blank', 'noopener,noreferrer')
    setGcashStatus({
      kind: 'loading',
      message: `GCash QR opened. After payment, click Check status to confirm ${gcashTier} access.`,
    })
  }

  async function checkGcapsule() {
    // Calls placeholder callback endpoint. In a real flow, GCash would call this server-to-server.
    // Here we simulate the “secure” gating path so UI works.
    setGcashStatus({ kind: 'loading', message: 'Checking payment status…' })
    try {
      const data = await postJson('/.netlify/functions/gcash-callback', { tier: gcashTier })
      localStorage.setItem(ACCESS_STORAGE_KEY, data.token)
      setAccess({ ok: true, tier: data.tier })
      setGcashStatus({ kind: 'ok', message: `Payment unlocked: ${data.tier}` })
    } catch (e) {
      const message = String(e.message || 'Request failed. Please try again.')
      setGcashStatus({ kind: 'error', message })
    }
  }

  if (!showPayment) {
    return (
      <div className="resume-wrap">
        <section className="landingTop">
          <div className="splineBg" aria-hidden="true">
            <spline-viewer
              url="https://prod.spline.design/lP-OmJ1jEYSOttfK/scene.splinecode"
              className="splineViewer"
            ></spline-viewer>
            <div className="splineOverlay" />
          </div>

          <div className="landingInner">
            <div className="landingHero">
              <p className="landingKicker">Welcome</p>
              <h1 className="landingHeroTitle">This Is my Job Resume</h1>
              <p className="landingSubhead">To Know More Click the Button Below</p>
              <button className="btn primary" onClick={() => setShowPayment(true)}>
                View resume
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="resume-wrap">
      <main className="grid">
          <section className="card payCard" id="payment" style={{ scrollMarginTop: '100px' }}>
            <div className="payHeader">
              <button className="btn secondary" onClick={() => setShowPayment(false)}>
                Back
              </button>
              <div>
                <h2>Subscribe to Unlock My Full Potential</h2>
                
              </div>
            </div>

          <div className="divider" />

          {!access.ok ? (
            <>
              <div className="pay-options">
                <div className="option">
                  <div className="opt-title">Basic</div>
                  <div className="opt-price">₱ {BASIC_PRICE} / month</div>
                  <button className="btn" onClick={() => setGcashTier('basic')}>
                    Select Basic
                  </button>
                </div>

                <div className="option">
                  <div className="opt-title">Premium</div>
                  <div className="opt-price">₱ {PREMIUM_PRICE} / month</div>
                  <button className="btn" onClick={() => setGcashTier('premium')}>
                    Select Premium
                  </button>
                </div>
              </div>

              <div className="divider" />

              <div className="gcash">
                <h3>Pay with GCash</h3>
                

                <div className="gcash-row">
                  <div className="gcash-pill">Tier: {gcashTier}</div>
                  <button className="btn primary" onClick={startGcashPayment}>
                    Get GCash QR
                  </button>
                </div>

                <button className="btn" onClick={checkGcapsule}>
                  Confirm payment status
                </button>

                {gcashStatus ? <p className={gcashStatus.kind === 'error' ? 'err' : gcashStatus.kind === 'ok' ? 'ok' : ''}>{gcashStatus.message}</p> : null}
              </div>

              <div className="divider" />

              <div className="gift">
                <h3>Gift code unlock</h3>
                

                <div className="gift-row">
                  <input
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && redeemGift()}
                    className="input"
                    placeholder="Enter gift code"
                    autoComplete="off"
                  />
                  <button className="btn primary" onClick={redeemGift} disabled={!giftCode.trim()}>
                    Redeem gift code
                  </button>
                </div>

                {giftStatus ? <p className={giftStatus.kind === 'error' ? 'err' : giftStatus.kind === 'ok' ? 'ok' : ''}>{giftStatus.message}</p> : null}

              
              </div>
            </>
          ) : (
            <div className="pdf-wrap">
              <div className="ok">Resume unlocked — scroll to the resume section below.</div>
              <a href={RESUME_URL} target="_blank" rel="noreferrer" className="btn primary">
                Open PDF
              </a>
            </div>
          )}
        </section>

        <ResumeSection accessOk={access.ok} />
      </main>
      <footer className="footer">
        <p className="muted small">
          This is a template for secure gating. Replace the GCash callback placeholder and the in-memory token store with real backend storage.
        </p>
      </footer>
    </div>
  )
}

export default App



import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState(
    localStorage.getItem('rememberedEmail') || ''
  )
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.login({ email, password })
      
      // Debug logging
      console.log('✅ Login response:', data)
      console.log('✅ Response keys:', Object.keys(data))
      
      // Try every possible field name the backend might use
      const token =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.jwt ||
        data.jwtToken ||
        data.Authorization ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token

      if (!token) {
        console.error('Full response was:', data)
        throw new Error('Token not found in response')
      }

      localStorage.setItem('token', token)
      if (remember) localStorage.setItem('rememberedEmail', email)
      else localStorage.removeItem('rememberedEmail')
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'ERR_NETWORK') {
        setError('Server connection failed. Please try again shortly.')
      } else if (err.response?.status === 401) {
        setError('Incorrect email or password.')
      } else if (err.response?.status === 404) {
        setError('Account not found. Please register first.')
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Decorative background circles */}
      <div style={{
        position:'fixed', top:-100, right:-100,
        width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'fixed', bottom:-150, left:-100,
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>

      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:22, marginBottom:16,
            boxShadow:'0 8px 24px rgba(79,70,229,0.35)',
          }}>⚡</div>
          <h1 style={{
            fontSize:24, fontWeight:700, color:'#0f172a',
            fontFamily:"'Space Grotesk', sans-serif", margin:'0 0 6px',
          }}>Welcome back</h1>
          <p style={{fontSize:14, color:'#64748b', margin:0}}>
            Sign in to your Finly account
          </p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div style={{marginBottom:16}}>
            <label style={{
              display:'block', fontSize:13, fontWeight:500,
              color:'#374151', marginBottom:6,
            }}>
              Email address
            </label>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                fontSize:16, pointerEvents:'none',
              }}>✉️</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width:'100%', height:46, paddingLeft:38, paddingRight:14,
                  border:'1.5px solid #e2e8f0', borderRadius:10,
                  fontSize:14, color:'#0f172a', background:'#f8fafc',
                  outline:'none', transition:'all 0.2s',
                  fontFamily:"'Inter',sans-serif",
                  boxSizing:'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor='#4f46e5'
                  e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)'
                  e.target.style.background='#fff'
                }}
                onBlur={e => {
                  e.target.style.borderColor='#e2e8f0'
                  e.target.style.boxShadow='none'
                  e.target.style.background='#f8fafc'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:16}}>
            <label style={{
              display:'block', fontSize:13, fontWeight:500,
              color:'#374151', marginBottom:6,
            }}>
              Password
            </label>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                fontSize:16, pointerEvents:'none',
              }}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width:'100%', height:46, paddingLeft:38, paddingRight:46,
                  border:'1.5px solid #e2e8f0', borderRadius:10,
                  fontSize:14, color:'#0f172a', background:'#f8fafc',
                  outline:'none', transition:'all 0.2s',
                  fontFamily:"'Inter',sans-serif",
                  boxSizing:'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor='#4f46e5'
                  e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)'
                  e.target.style.background='#fff'
                }}
                onBlur={e => {
                  e.target.style.borderColor='#e2e8f0'
                  e.target.style.boxShadow='none'
                  e.target.style.background='#f8fafc'
                }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:16, color:'#94a3b8', padding:4,
                }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginBottom:20,
          }}>
            <label style={{
              display:'flex', alignItems:'center', gap:8,
              fontSize:13, color:'#475569', cursor:'pointer',
            }}>
              <input type="checkbox" checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{width:16,height:16,accentColor:'#4f46e5'}}
              />
              Remember me
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background:'#fff1f2', border:'1px solid #fecdd3',
              borderRadius:10, padding:'10px 14px',
              fontSize:13, color:'#be123c',
              display:'flex', alignItems:'flex-start', gap:8,
              marginBottom:16,
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN BUTTON — ALWAYS VISIBLE */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width:'100%', height:48,
              background: (loading || !email || !password)
                ? '#c7d2fe'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color:'#ffffff',
              border:'none', borderRadius:12,
              fontSize:15, fontWeight:600,
              cursor:(loading || !email || !password) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.2s ease',
              boxShadow: (loading || !email || !password)
                ? 'none'
                : '0 4px 14px rgba(79,70,229,0.4)',
              fontFamily:"'Inter',sans-serif",
              letterSpacing:'0.01em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* Terms note */}
          <p style={{
            fontSize:11, color:'#94a3b8', textAlign:'center',
            marginTop:14, lineHeight:1.5,
          }}>
            By signing in you agree to our{' '}
            <span
              onClick={() => document.getElementById('terms-modal').style.display='flex'}
              style={{color:'#4f46e5', cursor:'pointer', textDecoration:'underline'}}
            >
              Terms of Service
            </span>{' '}
            and{' '}
            <span
              onClick={() => document.getElementById('privacy-modal').style.display='flex'}
              style={{color:'#4f46e5', cursor:'pointer', textDecoration:'underline'}}
            >
              Privacy Policy
            </span>
          </p>
        </form>

        {/* Register link */}
        <div style={{
          borderTop:'1px solid #f1f5f9', marginTop:20, paddingTop:20,
          textAlign:'center',
        }}>
          <p style={{fontSize:14, color:'#64748b', margin:0}}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color:'#4f46e5', fontWeight:600, textDecoration:'none',
            }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* TERMS OF SERVICE MODAL */}
      <div id="terms-modal" style={{
        display:'none', position:'fixed', inset:0,
        background:'rgba(0,0,0,0.6)', zIndex:1000,
        alignItems:'center', justifyContent:'center', padding:20,
      }}
        onClick={e => e.target.id==='terms-modal' &&
          (document.getElementById('terms-modal').style.display='none')}
      >
        <div style={{
          background:'#fff', borderRadius:20, padding:'32px',
          maxWidth:520, width:'100%', maxHeight:'80vh', overflowY:'auto',
          position:'relative',
        }}>
          <button onClick={() => document.getElementById('terms-modal').style.display='none'}
            style={{
              position:'absolute', top:16, right:16,
              background:'#f1f5f9', border:'none', borderRadius:8,
              width:32, height:32, cursor:'pointer', fontSize:16,
            }}>✕</button>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,marginBottom:6}}>
            Terms of Service
          </h2>
          <p style={{fontSize:12,color:'#94a3b8',marginBottom:20}}>
            Effective date: March 2026
          </p>
          <div style={{fontSize:14,color:'#374151',lineHeight:1.8,
            display:'flex',flexDirection:'column',gap:14}}>
            <p><strong>1. Acceptance of Terms.</strong> By accessing or using Finly, you confirm that you are at least 18 years old and agree to be bound by these Terms of Service.</p>
            <p><strong>2. Account Responsibility.</strong> You are responsible for maintaining the confidentiality of your login credentials. All activity under your account is your responsibility.</p>
            <p><strong>3. Permitted Use.</strong> Finly is provided for personal financial tracking and management purposes only. You may not use it for illegal activities or fraud.</p>
            <p><strong>4. Data Accuracy.</strong> You agree to provide accurate financial information. Finly does not verify the accuracy of transactions or balances you enter.</p>
            <p><strong>5. Financial Advice Disclaimer.</strong> Finly is a budgeting and tracking tool only. Nothing constitutes financial, investment, or legal advice.</p>
            <p><strong>6. Service Availability.</strong> We strive for 99% uptime but do not guarantee uninterrupted service.</p>
            <p><strong>7. Intellectual Property.</strong> All content and technology in Finly is the intellectual property of the Finly team.</p>
            <p><strong>8. Termination.</strong> We reserve the right to suspend or terminate accounts that violate these Terms.</p>
            <p><strong>9. Limitation of Liability.</strong> Finly is not liable for any financial loss resulting from your use of the platform.</p>
            <p><strong>10. Changes to Terms.</strong> We may update these Terms at any time. Continued use constitutes acceptance.</p>
          </div>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      <div id="privacy-modal" style={{
        display:'none', position:'fixed', inset:0,
        background:'rgba(0,0,0,0.6)', zIndex:1000,
        alignItems:'center', justifyContent:'center', padding:20,
      }}
        onClick={e => e.target.id==='privacy-modal' &&
          (document.getElementById('privacy-modal').style.display='none')}
      >
        <div style={{
          background:'#fff', borderRadius:20, padding:'32px',
          maxWidth:520, width:'100%', maxHeight:'80vh', overflowY:'auto',
          position:'relative',
        }}>
          <button onClick={() => document.getElementById('privacy-modal').style.display='none'}
            style={{
              position:'absolute', top:16, right:16,
              background:'#f1f5f9', border:'none', borderRadius:8,
              width:32, height:32, cursor:'pointer', fontSize:16,
            }}>✕</button>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,marginBottom:6}}>
            Privacy Policy
          </h2>
          <p style={{fontSize:12,color:'#94a3b8',marginBottom:20}}>
            Effective date: March 2026
          </p>
          <div style={{fontSize:14,color:'#374151',lineHeight:1.8,
            display:'flex',flexDirection:'column',gap:14}}>
            <p><strong>1. What We Collect.</strong> Finly collects your email address, password (encrypted), and financial data you enter.</p>
            <p><strong>2. How We Use Your Data.</strong> Your data is used exclusively to provide personal finance tracking features.</p>
            <p><strong>3. Data Storage.</strong> All data is stored on secure servers. Financial data is encrypted in transit using TLS/HTTPS.</p>
            <p><strong>4. Data Sharing.</strong> We do not share, sell, or trade your information with any third parties.</p>
            <p><strong>5. Cookies and Local Storage.</strong> Finly uses browser local storage to keep you logged in via JWT token.</p>
            <p><strong>6. Data Retention.</strong> Your data is retained as long as your account is active.</p>
            <p><strong>7. Your Rights.</strong> You have the right to access, correct, or delete your data at any time.</p>
            <p><strong>8. Children's Privacy.</strong> Finly is not intended for use by anyone under 18 years of age.</p>
            <p><strong>9. Security.</strong> We take reasonable measures to protect your data. Use a strong, unique password.</p>
            <p><strong>10. Contact.</strong> For privacy-related questions, contact the Finly team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

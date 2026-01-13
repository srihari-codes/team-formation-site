require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');

const XLSX = require('xlsx');

const { Student, Preference, Team, Settings } = require('./models');
const { getStudentsByBatch, savePreference, getTeamStatus, finalizeTeams, closeSelection, openSelection, isSelectionOpen, getExportData } = require('./teamLogic');

// Import security middleware
const {
  globalLimiter,
  authLimiter,
  captchaLimiter,
  adminLimiter,
  selectionLimiter,
  speedLimiter,
  sanitizeInput,
  deepSanitizeMiddleware,
  helmetConfig,
  corsConfig,
  hpp,
  bruteForceProtection,
  trackFailedAttempt,
  clearFailedAttempts,
  isValidRollNo,
  isValidBatch,
  isValidSessionId,
  isValidOTP,
  isValidCaptcha,
  isValidJWT,
  isValidChoices,
  errorHandler,
  notFoundHandler,
  securityLogger
} = require('./security');

const app = express();

// ==================== SECURITY MIDDLEWARE (ORDER MATTERS!) ====================

// 1. Trust proxy (if behind nginx/cloudflare)
app.set('trust proxy', 1);

// 2. Security headers
app.use(helmetConfig);

// 3. CORS
app.use(corsConfig);

// 4. Security logging
app.use(securityLogger);

// 5. Global rate limiting
app.use(globalLimiter);

// 6. Speed limiter
app.use(speedLimiter);

// 7. Body parser with size limit
app.use(express.json({ limit: '10kb' })); // Limit payload size to 10KB
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 8. HTTP Parameter Pollution protection
app.use(hpp());

// 9. NoSQL injection protection
app.use(sanitizeInput);

// 10. Deep sanitization
app.use(deepSanitizeMiddleware);

// ==================== CONFIGURATION ====================

const port = process.env.PORT || 3000;

// Validate required env vars
const requiredEnvVars = ['JWT_SECRET', 'TEMP_SECRET', 'MONGO_URI', 'ADMIN_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Validate secret strength
if (process.env.JWT_SECRET.length < 32 || process.env.TEMP_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET and TEMP_SECRET must be at least 32 characters');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const TEMP_SECRET = process.env.TEMP_SECRET;
const MONGO_URI = process.env.MONGO_URI;

const BASE_URL = 'https://erpsrm.com/srmhonline';

const COMMON_HEADERS = {
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-IN,en;q=0.9',
  'connection': 'keep-alive',
  'host': 'erpsrm.com',
  'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
};

// ==================== HELPERS ====================

async function erpRequest(options) {
  const { method = 'GET', url, headers = {}, data, responseType } = options;
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      headers: { ...COMMON_HEADERS, ...headers },
      data,
      responseType,
      timeout: 15000, // 15 second timeout
      maxRedirects: 3 // Limit redirects
    });
    return { success: true, response };
  } catch (error) {
    console.error(`[ERP Request Failed] ${url}:`, error.message);
    return { success: false, error };
  }
}

function generateTempToken(username, sessionId, iValue) {
  return jwt.sign({ username, sessionId, iValue, type: 'temp' }, TEMP_SECRET, { expiresIn: '5m' });
}

function verifyTempToken(token) {
  try {
    if (!isValidJWT(token)) return null;
    const decoded = jwt.verify(token, TEMP_SECRET);
    return decoded.type === 'temp' ? decoded : null;
  } catch { return null; }
}

function generateAccessToken(username, batch) {
  return jwt.sign({ username, batch, type: 'access' }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyAccessToken(token) {
  try {
    if (!isValidJWT(token)) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.type === 'access' ? decoded : null;
  } catch { return null; }
}

// ==================== MIDDLEWARE ====================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!isValidJWT(token)) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });
  
  // Validate decoded data
  if (!isValidRollNo(decoded.username) || !isValidBatch(decoded.batch)) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }
  
  req.user = decoded;
  next();
}

function adminMiddleware(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || typeof adminKey !== 'string') {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  
  // Constant-time comparison to prevent timing attacks
  const expected = process.env.ADMIN_KEY;
  if (adminKey.length !== expected.length) {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  
  let result = 0;
  for (let i = 0; i < adminKey.length; i++) {
    result |= adminKey.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  
  if (result !== 0) {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  
  next();
}

// ==================== HEALTH CHECK ====================

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
  });
});

// ==================== AUTH ROUTES ====================

app.get('/get-session', authLimiter, bruteForceProtection, async (req, res) => {
  const result = await erpRequest({
    url: '/students/loginManager/youLogin.jsp',
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'referer': 'https://srmvalliammai.ac.in/',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate'
    }
  });

  if (!result.success) return res.status(502).json({ error: 'ERP unavailable' });

  const setCookie = result.response.headers['set-cookie'];
  let sessionId = null;
  
  if (setCookie) {
    const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    const match = cookieStr.match(/JSESSIONID=([^;]+)/);
    if (match) sessionId = match[1];
    // DON'T forward cookies to client - security risk
  }

  if (!sessionId) return res.status(502).json({ error: 'Session not found' });
  
  // Validate session ID format
  if (!isValidSessionId(sessionId)) {
    return res.status(502).json({ error: 'Invalid session received' });
  }
  
  res.json({ session_id: sessionId });
});

app.get('/captcha', captchaLimiter, bruteForceProtection, async (req, res) => {
  const { session_id } = req.query;
  
  if (!session_id || !isValidSessionId(session_id)) {
    return res.status(400).json({ error: 'Valid session_id required' });
  }

  const result = await erpRequest({
    url: '/captchas',
    headers: {
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'cookie': `JSESSIONID=${session_id}`,
      'referer': `${BASE_URL}/studentportal/loginManager/youLogin.jsp`
    },
    responseType: 'arraybuffer'
  });

  if (!result.success) return res.status(502).json({ error: 'Captcha fetch failed' });
  
  // Validate content type
  const contentType = result.response.headers['content-type'];
  if (!contentType?.startsWith('image/')) {
    return res.status(502).json({ error: 'Invalid captcha response' });
  }
  
  res.set('Content-Type', contentType);
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.send(result.response.data);
});

app.get('/get-otp', authLimiter, bruteForceProtection, async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const { session_id, username, password, captcha } = req.query;
  
  // Validate all inputs
  if (!session_id || !isValidSessionId(session_id)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid session_id required' });
  }
  
  if (!username || !isValidRollNo(username)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid username required' });
  }
  
  if (!password || typeof password !== 'string' || password.length < 4 || password.length > 50) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid password required' });
  }
  
  if (!captcha || !isValidCaptcha(captcha)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid captcha required' });
  }

  const result = await erpRequest({
    method: 'POST',
    url: '/studentportal/loginManager/youLogin.jsp',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': `JSESSIONID=${session_id}`,
      'referer': `${BASE_URL}/studentportal/loginManager/youLogin.jsp`
    },
    data: qs.stringify({
      login: 'iamalsouser', passwd: 'password', ccode: captcha, txtSK: password,
      txtAN: username, hdnCaptcha: captcha, _tries: '1', _md5: '', txtPageAction: '1'
    })
  });

  const responseData = result.response.data.toString();
  
  const isHuman = !/invalid captcha/i.test(responseData);
  const isCredential = !responseData.includes('Invalid User ID or Password');
  const isSuccess = responseData.includes('funAttPageController()');

  const responsePayload = {
    human: isHuman,
    credential: isCredential,
    success: isSuccess
  };

  if (!isHuman || !isCredential || !isSuccess) {
    trackFailedAttempt(ip);
    // If it's a known failure (captcha or creds), return the flags.
    // We return 200 OK so the client can parse the flags specifically.
    return res.json(responsePayload);
  }

  // Clear failed attempts on success
  clearFailedAttempts(ip);
  
  // Extract 'i' value from Location header
  let iValue = null;
  const locationHeader = result.response.request.res.responseUrl || result.response.headers['location'] || result.response.headers['Location'];
  
  if (locationHeader) {
     const urlParts = locationHeader.split('?');
     if (urlParts.length > 1) {
       const queryParams = qs.parse(urlParts[1]);
       if (queryParams.i) {
         iValue = queryParams.i;
       }
     }
  }

  // Fallback: check if 'i' is in the body scripts (sometimes it's redirected via JS)
  if (!iValue) {
      // Logic to find 'i' in body if needed, but user specified header. 
      // We will leave it as null if not found, and handle fallback in login.
  }

  const tempToken = generateTempToken(username, session_id, iValue);
  res.json({ ...responsePayload, temp_token: tempToken });
});

app.get('/login', authLimiter, bruteForceProtection, async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const { otp, session_id, temp_token } = req.query;
  
  // Validate inputs
  if (!otp || !isValidOTP(otp)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid OTP required' });
  }
  
  if (!session_id || !isValidSessionId(session_id)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid session_id required' });
  }
  
  if (!temp_token || !isValidJWT(temp_token)) {
    trackFailedAttempt(ip);
    return res.status(400).json({ error: 'Valid temp_token required' });
  }

  const tempData = verifyTempToken(temp_token);
  if (!tempData) {
    trackFailedAttempt(ip);
    return res.status(401).json({ error: 'Invalid or expired temp token' });
  }
  
  if (tempData.sessionId !== session_id) {
    trackFailedAttempt(ip);
    return res.status(401).json({ error: 'Session mismatch' });
  }



  const result = await erpRequest({
    method: 'POST',
    url: '/studentportal/loginManager/youLoginv.jsp',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': `JSESSIONID=${session_id}`,
      'referer': `${BASE_URL}/studentportal/loginManager/youLoginv.jsp`
    },
    data: `otppasswd=${otp}&txtPageAction=1&OtpPassWord=${otp}&txtSK=&txtAN=&_tries=1&_md5=&txtPageAction=0&i=${encodeURIComponent(encodeURIComponent(tempData.iValue))}`
  });

  if (!result.success) {
    trackFailedAttempt(ip);
    console.error('[ERP Login Error]', result.error?.message);
    return res.status(502).json({ error: 'ERP login request failed. Please try again.' });
  }

  const is200 = result.success && result.response.status === 200;
  const responseData = result.response.data ? result.response.data.toString() : '';
  const isVerified = is200 && responseData.includes('Please wait login screen is loading...');

  if (!isVerified) {
    trackFailedAttempt(ip);

    if (responseData.includes('Login failed')) {
      const match = responseData.match(/\*+\s*(\d{3})/);
      const lastThreeDigits = match ? match[1] : null;
      return res.status(401).json({ verified: false, wrong_otp: true, last_three_digits: lastThreeDigits });
    }

    return res.status(401).json({ verified: false });
  }

  // Student MUST exist in DB (admin pre-registers with batch)
  const rollNo = tempData.username;
  
  // Additional validation
  if (!isValidRollNo(rollNo)) {
    return res.status(400).json({ error: 'Invalid roll number format' });
  }
  
  const student = await Student.findOne({ rollNo });
  
  if (!student) {
    return res.status(403).json({ error: 'Not registered. Contact admin.' });
  }

  // Clear failed attempts on successful login
  clearFailedAttempts(ip);
  
  const accessToken = generateAccessToken(rollNo, student.batch);
  res.json({ verified: true, access_token: accessToken, username: rollNo, batch: student.batch });
});

app.post('/forgot-password', authLimiter, bruteForceProtection, async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  try {
    const { txt_Email, iden } = req.body;
    
    if (!txt_Email || !iden) {
       return res.status(400).json({ error: 'Email and Identifier required' });
    }

    const result = await erpRequest({
      method: 'POST',
      url: '/studentportal/loginManager/forgotPasswordInner.jsp',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({ txt_Email, iden })
    });

    if (!result.success) {
      throw result.error;
    }
    
    res.json(result.response.data);
  } catch (error) {
    trackFailedAttempt(ip);
    console.error('Proxy Error:', error.message);
    res.status(500).json({ 
      result: "Proxy Error", 
      resultstatus: "0", 
      resultmsg: "Failed to communicate with external server." 
    });
  }
});

// ==================== TEAM ROUTES (PROTECTED) ====================

app.get('/me', authMiddleware, async (req, res) => {
  const student = await Student.findOne({ rollNo: req.user.username });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  
  const pref = await Preference.findOne({ rollNo: req.user.username });
  res.json({
    rollNo: student.rollNo,
    name: student.name,
    batch: student.batch,
    teamId: student.teamId,
    editAttemptsLeft: student.editAttemptsLeft,
    currentChoices: pref?.choices || []
  });
});

app.get('/students', authMiddleware, async (req, res) => {
  const students = await getStudentsByBatch(req.user.batch);
  res.json({ batch: req.user.batch, students });
});

app.post('/team/selection', authMiddleware, selectionLimiter, async (req, res) => {
  const { choices } = req.body;
  
  // Validate choices
  if (!isValidChoices(choices)) {
    return res.status(400).json({ error: 'Must provide exactly 2 valid roll numbers' });
  }
  
  // Ensure choices don't include self
  if (choices.includes(req.user.username)) {
    return res.status(400).json({ error: 'Cannot select yourself' });
  }
  
  // Ensure no duplicates
  if (choices[0] === choices[1]) {
    return res.status(400).json({ error: 'Cannot select same person twice' });
  }
  
  try {
    const result = await savePreference(req.user.username, choices);
    res.json(result);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message || 'Internal error' });
  }
});

app.get('/team/status', authMiddleware, async (req, res) => {
  try {
    const status = await getTeamStatus(req.user.username);
    res.json(status);
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message || 'Internal error' });
  }
});

// ==================== ADMIN ROUTES ====================

app.post('/admin/finalize', adminMiddleware, adminLimiter, async (req, res) => {
  const { batch } = req.body;
  
  if (!batch || !isValidBatch(batch)) {
    return res.status(400).json({ error: 'Valid batch (A or B) required' });
  }

  try {
    const result = await finalizeTeams(batch);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Finalization failed' });
  }
});

app.post('/admin/selection/close', adminMiddleware, adminLimiter, async (req, res) => {
  const { batch } = req.body;
  
  if (!batch || !isValidBatch(batch)) {
    return res.status(400).json({ error: 'Valid batch (A or B) required' });
  }

  const result = await closeSelection(batch);
  res.json(result);
});

app.post('/admin/selection/open', adminMiddleware, adminLimiter, async (req, res) => {
  const { batch } = req.body;
  
  if (!batch || !isValidBatch(batch)) {
    return res.status(400).json({ error: 'Valid batch (A or B) required' });
  }

  const result = await openSelection(batch);
  res.json(result);
});

app.get('/admin/export/teams', adminMiddleware, adminLimiter, async (req, res) => {
  const { batch } = req.query;
  
  if (!batch || !isValidBatch(batch)) {
    return res.status(400).json({ error: 'Valid batch (A or B) required' });
  }

  try {
    const data = await getExportData(batch);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns (rough approximation)
    const colWidths = [
      { wch: 10 }, // Team No
      { wch: 8 },  // Batch
      { wch: 15 }, // Member 1 Roll
      { wch: 25 }, // Member 1 Name
      { wch: 15 }, // Member 2 Roll
      { wch: 25 }, // Member 2 Name
      { wch: 15 }, // Member 3 Roll
      { wch: 25 }  // Member 3 Name
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Teams_Batch_${batch}`);
    
    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    const filename = `Teams_Batch_${batch}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Disable caching for this endpoint to ensure fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.send(buf);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

app.get('/admin/selection/status', adminMiddleware, adminLimiter, async (req, res) => {
  const [batchA, batchB] = await Promise.all([
    isSelectionOpen('A'),
    isSelectionOpen('B')
  ]);
  res.json({ A: { selectionOpen: batchA }, B: { selectionOpen: batchB } });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== GRACEFUL SHUTDOWN ====================

let server;

async function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  
  // Force close after 10 seconds
  const forceExitTimeout = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('HTTP server closed');
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    clearTimeout(forceExitTimeout);
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// ==================== STARTUP ====================

mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('MongoDB connected successfully');
    
    server = app.listen(port, () => {
      console.log(`🔒 Secure server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

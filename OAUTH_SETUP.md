# Google OAuth Setup Guide

## 📋 Overview

Dokumentasi ini menjelaskan cara setup dan menggunakan Google OAuth login di backend.

---

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install google-auth-library
```

atau

```bash
yarn add google-auth-library
```

---

## 🔐 Google Cloud Console Setup

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable **Google+ API** atau **Google Identity Services**

### 2. Buat OAuth 2.0 Credentials

1. Pergi ke **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Pilih **Web application**
4. Konfigurasi:
   - **Name**: Your App Name
   - **Authorized JavaScript origins**: 
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorized redirect URIs**:
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com`

5. Copy **Client ID** dan **Client Secret**

---

## ⚙️ Environment Variables

Tambahkan ke file `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Contoh:**
```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456789
```

---

## 🚀 API Endpoints

### Google Login

**Endpoint:** `POST /api/oauth/google`

**Request Body:**
```json
{
  "token": "google_id_token_from_frontend",
  "role": "user"
}
```

**Parameters:**
- `token` (required): Google ID token dari frontend
- `role` (optional): "user" atau "tenant" (default: "user")

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe",
    "role": "user",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here",
  "message": "Google login successful"
}
```

**Error Responses:**

400 - Token tidak ada:
```json
{
  "error": "Google token is required"
}
```

400 - Role tidak valid:
```json
{
  "error": "Invalid role. Must be \"user\" or \"tenant\""
}
```

401 - Token Google tidak valid:
```json
{
  "error": "Invalid Google token"
}
```

---

## 💻 Frontend Integration

### React/Next.js dengan `@react-oauth/google`

#### 1. Install Package

```bash
npm install @react-oauth/google
```

#### 2. Setup Provider

```tsx
// app/layout.tsx atau _app.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
```

#### 3. Login Component

```tsx
'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/oauth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          role: 'user', // atau 'tenant'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token JWT
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect ke dashboard
        window.location.href = '/dashboard';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert('Google login failed');
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        text="continue_with"
        shape="rectangular"
        size="large"
        width="300"
      />
      {loading && <p>Loading...</p>}
    </div>
  );
}
```

#### 4. Environment Variables (Frontend)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 🔄 Flow Diagram

```
Frontend                    Backend                     Google
   |                          |                           |
   |--1. User clicks login--->|                           |
   |                          |                           |
   |<----2. Google popup------|                           |
   |                          |                           |
   |-------3. Authorize------>|                           |
   |                          |                           |
   |<----4. ID Token----------|                           |
   |                          |                           |
   |---5. Send ID Token------>|                           |
   |                          |                           |
   |                          |---6. Verify token-------->|
   |                          |                           |
   |                          |<--7. User info------------|
   |                          |                           |
   |                          |--8. Create/Get user       |
   |                          |                           |
   |                          |--9. Generate JWT          |
   |                          |                           |
   |<--10. JWT + User data----|                           |
   |                          |                           |
   |--11. Save & redirect---->|                           |
```

---

## ✅ Testing

### Test dengan Postman/Thunder Client

1. **Get Google ID Token** (dari browser console):
   - Login via frontend Google button
   - Capture `credentialResponse.credential`
   - Copy token

2. **Test API**:
   ```bash
   POST http://localhost:8000/api/oauth/google
   Content-Type: application/json

   {
     "token": "your_google_id_token_here",
     "role": "user"
   }
   ```

### Manual Test Flow

1. Setup frontend dengan Google OAuth button
2. Click button dan login dengan Google
3. Check backend logs untuk verify
4. Verify JWT token generated
5. Check database untuk user baru

---

## 📚 File Structure

```
src/
├── modules/
│   └── OAuth/
│       ├── oauth.service.ts      # Google OAuth logic
│       ├── oauth.controller.ts   # Handle HTTP requests
│       ├── oauth.router.ts       # Route definitions
│       ├── oauth.dto.ts          # Data transfer objects
│       └── validator/
│           └── oauth.validator.ts # Input validation
└── app.ts                         # Register OAuth router
```

---

## 🔍 How It Works

### Backend Flow:

1. **Receive Google ID Token** dari frontend
2. **Verify Token** menggunakan `google-auth-library`
3. **Extract User Info** (email, name, picture)
4. **Check if User Exists**:
   - Jika ada: Login user yang sudah ada
   - Jika tidak: Create user baru (tanpa password)
5. **Set Email as Verified** (karena Google sudah verify)
6. **Generate JWT Token** untuk authentication
7. **Return User Data + JWT**

### Key Features:

✅ **Automatic User Creation** - User otomatis dibuat saat first login  
✅ **Email Verification** - Email auto-verified (Google sudah verify)  
✅ **No Password Required** - OAuth user tidak perlu password  
✅ **Role Selection** - Support role "user" dan "tenant"  
✅ **JWT Integration** - Compatible dengan existing auth system  
✅ **Secure Token Verification** - Verify token dengan Google API  

---

## ⚠️ Security Best Practices

### 1. Token Verification
- ✅ Selalu verify token di backend
- ✅ Jangan percaya token dari frontend tanpa verify
- ✅ Check token expiry

### 2. Environment Variables
- ✅ Jangan commit `.env` ke git
- ✅ Use different credentials untuk dev/production
- ✅ Rotate secrets secara berkala

### 3. CORS Configuration
- ✅ Set allowed origins di `app.ts`
- ✅ Hanya allow domain yang valid
- ✅ Enable credentials untuk cookies

### 4. HTTPS
- ✅ Production HARUS menggunakan HTTPS
- ✅ Google OAuth callback require HTTPS di production

---

## 🐛 Troubleshooting

### Error: "Invalid Google token"

**Penyebab:**
- Token expired
- Token format salah
- Client ID tidak match

**Solusi:**
- Check GOOGLE_CLIENT_ID di backend match dengan frontend
- Generate token baru
- Verify token belum expired

### Error: "google-auth-library not found"

**Solusi:**
```bash
npm install google-auth-library
```

### User Created but Email Not Verified

**Penyebab:**
- Google tidak return `email_verified: true`

**Solusi:**
- Email verification biasanya auto-set `true`
- Check Google account settings
- Manual verify via admin panel

### CORS Error

**Solusi:**
```typescript
// src/app.ts
cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
})
```

---

## 📖 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [google-auth-library](https://www.npmjs.com/package/google-auth-library)

---

## 📝 Notes

- Google OAuth user **tidak memiliki password** di database
- User bisa login dengan Google atau email/password (jika set password nanti)
- Email otomatis verified untuk Google login
- Avatar URL dari Google bisa disimpan di `avatarUrl` field (opsional)

---

**Created:** 2024  
**Last Updated:** 2024


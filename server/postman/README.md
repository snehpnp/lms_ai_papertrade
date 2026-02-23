# Postman Collections – TradeLearn Pro

## Files (ye do use karein)

### 1. Full API (Admin + Subadmin + User sab)
- **Collection:** `TradeLearn_Pro_API.postman_collection.json`
- **Environment:** `TradeLearn_Pro.postman_environment.json`

### 2. Sirf User / App team ke liye
- **Collection:** `User_App_API.postman_collection.json`
- **Environment:** `User_App.postman_environment.json`

---

## Import kaise karein

1. Postman kholo.
2. **Import** pe click karo (left sidebar ya top).
3. **File** choose karke dono JSON select karo (collection + environment).
4. Environment select karo (top-right dropdown) – e.g. "User App - Local" ya "TradeLearn Pro - Local".
5. Environment me **baseUrl** set karo, e.g. `http://localhost:4000/api/v1`.
6. Login/Register karke **accessToken** (aur **refreshToken** agar use ho) copy karke environment variables me paste karo.

---

## Auth (token set karna)

- **Admin:** Auth → Admin Login → response me `accessToken` → environment me `accessToken` me paste.
- **User:** Auth → Login (ya Register) → same.
- Collection me **Authorization** = Bearer Token, value = `{{accessToken}}` already set hai.

---

## Folder structure (Full collection)

- Auth (admin/subadmin/user login, register, refresh, logout, change/forgot/reset password)
- Admin – Users, Courses, Wallet & Trading, Reports
- Subadmin (referral signup bonus, referred users, commission, course revenue)
- User – Wishlist, Paper Trading, Wallet, Courses, AI, Payments
- Health

**User App collection** me sirf user-facing APIs hain (Auth, Profile, Wishlist, Trading, Wallet, Courses, AI, Payments).

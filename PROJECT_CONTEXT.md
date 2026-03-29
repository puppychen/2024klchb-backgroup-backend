# PROJECT_CONTEXT.md - 後台管理後端

## 專案概述

基隆親子照護平台管理後台後端，提供醫療諮詢管理系統的行政管理功能。

## 技術棧

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (passport-jwt)
- **Deployment**: Firebase Functions (asia-east1)
- **Runtime**: Node.js 20

## 模組架構

| 模組 | 職責 |
|------|------|
| AuthModule | JWT 認證、管理員登入/註冊、角色守衛 |
| AdminModule | 管理員 CRUD、角色管理 |
| ConsultationModule | 諮詢記錄管理 |
| FacilityModule | 醫療機構管理 |
| UserModule | 用戶管理、LINE 名稱補回、來源關鍵字追蹤 (imports HttpModule) |
| PrismaService | 資料庫連線與 ORM |

## 用戶管理功能

### API 端點

| Method | Path | 說明 |
|--------|------|------|
| GET | /user | 用戶列表（含 LINE 名稱 backfill、sourceName mapping） |
| GET | /user/source-users | 幼兒專責關聯使用者列表 |
| GET | /user/:uuid | 單一用戶詳細資料 |
| GET | /user/:uuid/children | 用戶小朋友（Prisma Children 資料表） |
| GET | /user/:uuid/notes | 用戶記事本列表 |
| GET | /user/:uuid/notes/:noteUuid | 單一記事本含編輯歷史 |
| POST | /user/:uuid/notes | 建立記事本 |
| PATCH | /user/:uuid/notes/:noteUuid | 更新記事本 |
| DELETE | /user/:uuid/notes/:noteUuid | 刪除記事本（軟刪除） |

### users.content JSON 結構

使用者透過 LIFF 表單填寫的資料存於 `users.content` (Prisma `Json?` 型別)：

```json
{
  "name": "陳悅昕",
  "phone": "0963785421",
  "address": "新北市三重區仁愛街425巷90號",
  "childes": [
    {
      "age": "3m",
      "name": "允喬",
      "weight": "5.4",
      "birthDate": "2025-12-01",
      "primary_medical": "惠心",
      "vaccineReminder": true
    }
  ],
  "profile": {
    "userId": "Uae8da0ac...",
    "pictureUrl": "https://profile.line-scdn.net/...",
    "displayName": "悅昕"
  },
  "child_number": 1
}
```

### LINE 名稱補回機制 (backfillLineProfiles)

用戶列表 API 自動補回 `users.name` 為 null 的使用者：

1. **階段一（DB-only）**：檢查 `content.profile.displayName`，有值直接寫回 `users.name`。無 API 呼叫、無上限。
2. **階段二（LINE Bot API）**：仍缺 name 者呼叫 `GET /v2/bot/profile/{lineId}`，每筆間隔 200ms，每次最多 30 筆。

來源使用者 API (`/user/source-users`) 的 `lineName` 也含 `content.profile.displayName` fallback。

### 來源名稱對應

- `users.source_keyword`：使用者關聯的來源關鍵字
- `source_keywords` 資料表：`keyword` → `name` 對應表
- API 回傳的 `sourceName`：查表取得人類可讀名稱，查不到則顯示原始 keyword

### 記事本管理

- 更新/刪除自動建立 `NoteEditHistory` 記錄
- 刪除為軟刪除（設 `deletedAt`），afterContent 標記為 "刪除!!"

## 環境變數

| 變數 | 用途 |
|------|------|
| DATABASE_URL | PostgreSQL 連線字串 |
| JWT_SECRET | JWT 簽章密鑰 |
| NODE_ENV | 環境模式 |
| LINE_ACCESS_TOKEN | LINE Bot channel access token（用戶名稱補回） |

## 資料庫關鍵模型

- **User**: LINE 用戶（lineId 識別），content 為 LIFF 表單 JSON
- **Admin**: 後台管理員（username/password 認證）
- **Children**: 小朋友資料（Prisma 關聯，與 content.childes 為不同資料來源）
- **Note / NoteEditHistory**: 記事本與編輯歷史追蹤
- **SourceKeyword**: 來源關鍵字名稱對應表
- **Consultation**: 諮詢記錄
- **Facility / FacilityUser**: 醫療機構與人員

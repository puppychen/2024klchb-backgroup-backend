# 遠距諮詢管理後台 Backend

## 專案描述

本專案為遠距諮詢管理後台的後端程式，提供管理功能的 API 服務，主要包含：

- **系統管理者帳號管理** - 管理後台使用者帳號與權限
- **就醫資訊醫療機構管理** - 管理醫療機構資訊與相關人員
- **諮詢紀錄管理** - 處理遠距諮詢記錄的儲存與查詢
- **使用者管理** - 整合 LINE 平台的使用者資料管理
- **疫苗通知系統** - 兒童疫苗接種提醒功能
- **筆記功能** - 支援存取權杖的筆記分享系統

## 技術架構

- **後端框架**: NestJS (基於 Node.js)
- **資料庫**: PostgreSQL + Prisma ORM
- **身份驗證**: JWT + Passport
- **部署平台**: Firebase Functions (asia-east1)
- **開發語言**: TypeScript
- **Node.js 版本**: 20

## 環境設定

```bash
# 安裝相依套件
$ npm install

# 設定環境變數檔案
$ cp .env.example .env
```

環境變數設定：
- `DATABASE_URL` - PostgreSQL 資料庫連線字串
- `JWT_SECRET` - JWT 簽章密鑰
- `NODE_ENV` - 執行環境 (development/production)

## 資料庫設定 (Prisma)

```bash
# 產生 Prisma Client
$ npx prisma generate

# 執行資料庫遷移
$ npx prisma migrate dev

# 填入初始資料
$ npx prisma db seed

# 開啟資料庫管理介面
$ npx prisma studio
```

## 專案執行

```bash
# 開發模式 (含檔案監控)
$ npm run start:dev

# 一般執行
$ npm run start

# 除錯模式
$ npm run start:debug

# 正式環境執行
$ npm run start:prod
```

## 測試執行

```bash
# 單元測試
$ npm run test

# 測試監控模式
$ npm run test:watch

# 端對端測試
$ npm run test:e2e

# 測試覆蓋率報告
$ npm run test:cov

# 除錯測試
$ npm run test:debug
```

## 程式碼品質檢查

```bash
# ESLint 檢查與修正
$ npm run lint

# Prettier 程式碼格式化
$ npm run format
```

## Firebase 部署

```bash
# 本地開發模擬器
$ npm run serve

# 部署至正式環境
$ npm run deploy

# 查看函數執行記錄
$ npm run logs

# Firebase 函數互動 Shell
$ npm run shell
```

## 專案架構

### 核心模組
- `AuthModule` - 身份驗證與授權管理
- `AdminModule` - 系統管理者功能
- `ConsultationModule` - 諮詢記錄管理
- `FacilityModule` - 醫療機構管理

### 資料庫模型
- `Admin` - 系統管理者帳號
- `User` - 一般使用者 (整合 LINE)
- `Consultation` - 諮詢記錄
- `Facility` - 醫療機構
- `Note` - 筆記系統
- `VaccineNotify` - 疫苗通知

## API 端點

主要 API 路由：
- `/auth` - 身份驗證相關 (登入、註冊)
- `/admin` - 系統管理者管理
- `/consultation` - 諮詢記錄管理
- `/facility` - 醫療機構管理

## 開發注意事項

1. **環境變數**: 請確保正確設定 `.env` 檔案中的所有必要變數
2. **資料庫**: 使用 PostgreSQL，透過 Prisma 進行 ORM 操作
3. **身份驗證**: 所有管理 API 皆需要 JWT 驗證
4. **部署**: 使用 Firebase Functions 部署至 asia-east1 區域
5. **程式碼品質**: 提交前請執行 `npm run lint` 檢查程式碼品質

## 相關資源

- [NestJS 官方文件](https://docs.nestjs.com)
- [Prisma 文件](https://www.prisma.io/docs)
- [Firebase Functions 文件](https://firebase.google.com/docs/functions)

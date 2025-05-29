# T3 Blog System

T3 Stackを使用したモダンなブログシステムです。

## 特徴

- 📝 記事の作成・編集・公開/非公開
- 🏷️ カテゴリによる記事分類
- 🖼️ アイキャッチ画像の設定
- 👤 ユーザー認証・管理者権限
- 🎨 レスポンシブなモダンUI
- ⚡ TypeScriptによる型安全な開発

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API**: tRPC
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Code Quality**: Biome
- **Validation**: Zod

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

以下の環境変数を設定してください：

```env
# Database (Vercel Postgres)
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# NextAuth.js
AUTH_SECRET="your-random-secret-string"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Node Environment
NODE_ENV="development"
```

### 3. データベースのセットアップ

```bash
pnpm db:push
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは `http://localhost:3000` で利用できます。

## Vercelへのデプロイ

### 1. Vercel Postgresの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)でプロジェクトを作成
2. **Storage** → **Create Database** → **Postgres**を選択
3. データベース作成後、環境変数タブで`DATABASE_URL`と`DIRECT_URL`をコピー

### 2. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. APIs & Services → Credentials → OAuth 2.0 Client IDsを作成
3. Authorized redirect URIsに`https://your-domain.vercel.app/api/auth/callback/google`を追加

### 3. 環境変数の設定

Vercelプロジェクトの環境変数に以下を設定：

```env
DATABASE_URL=postgres://...（Vercel Postgresから取得）
DIRECT_URL=postgres://...（Vercel Postgresから取得）
AUTH_SECRET=your-random-secret-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
```

### 4. GitHubとの連携

1. GitHubリポジトリをVercelプロジェクトに接続
2. 自動デプロイが有効になります

### 5. データベースマイグレーション

初回デプロイ後、Vercel Functions内で以下を実行：

```bash
pnpm prisma migrate deploy
```

または、Vercel CLIを使用：

```bash
vercel env pull .env.local
pnpm prisma migrate deploy
```

## 使用方法

### 管理者権限の設定

初回ログイン後、データベースで該当ユーザーの`role`フィールドを`ADMIN`に変更してください：

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 記事の管理

1. 管理者でログイン
2. `/admin`にアクセス
3. 記事の作成・編集・削除が可能

### カテゴリの管理

1. 管理画面から「カテゴリ管理」を選択
2. カテゴリの作成・編集・削除が可能

## ディレクトリ構造

```
src/
├── app/
│   ├── _components/      # 共通コンポーネント
│   ├── admin/           # 管理画面
│   ├── posts/           # 記事ページ
│   ├── categories/      # カテゴリページ
│   └── layout.tsx       # レイアウト
├── server/
│   ├── api/
│   │   └── routers/     # tRPCルーター
│   ├── auth/            # 認証設定
│   └── db.ts            # データベース設定
└── trpc/                # tRPCクライアント設定
```

## 利用可能なスクリプト

```bash
# 開発サーバー
pnpm dev

# ビルド
pnpm build

# 本番サーバー
pnpm start

# 型チェック
pnpm typecheck

# コード品質チェック
pnpm check

# データベース管理
pnpm db:push      # スキーマを反映
pnpm db:studio    # Prisma Studio
pnpm db:migrate   # マイグレーション実行
```

## ライセンス

MIT License

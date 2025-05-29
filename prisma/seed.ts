import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // サンプルユーザーの作成（プロフィール情報付き）
  const user1 = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      bio: "フルスタック開発者として活動しています。React、Next.js、TypeScriptを使った開発が得意です。最新のWebテクノロジーについて学び、発信しています。",
      website: "https://demo-portfolio.example.com",
      twitter: "demo_developer",
      github: "demo-dev"
    },
    create: {
      email: "demo@example.com",
      name: "田中太郎",
      bio: "フルスタック開発者として活動しています。React、Next.js、TypeScriptを使った開発が得意です。最新のWebテクノロジーについて学び、発信しています。",
      website: "https://demo-portfolio.example.com",
      twitter: "demo_developer",
      github: "demo-dev"
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "designer@example.com" },
    update: {
      bio: "UI/UXデザイナーです。ユーザー体験を重視したデザインを心がけています。Figma、Adobe Creative Suiteを使用し、デザインシステムの構築も行っています。",
      website: "https://design-portfolio.example.com",
      twitter: "ui_designer_jp",
      github: "design-dev"
    },
    create: {
      email: "designer@example.com",
      name: "佐藤花子",
      bio: "UI/UXデザイナーです。ユーザー体験を重視したデザインを心がけています。Figma、Adobe Creative Suiteを使用し、デザインシステムの構築も行っています。",
      website: "https://design-portfolio.example.com",
      twitter: "ui_designer_jp",
      github: "design-dev"
    },
  });

  // カテゴリの作成
  const techCategory = await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: {
      name: "テクノロジー",
      slug: "tech",
      description: "プログラミング、開発、IT関連の記事"
    },
  });

  const designCategory = await prisma.category.upsert({
    where: { slug: "design" },
    update: {},
    create: {
      name: "デザイン",
      slug: "design",
      description: "UI/UX、グラフィックデザイン関連の記事"
    },
  });

  // サンプル記事の作成
  const post1 = await prisma.post.upsert({
    where: { slug: "next-js-guide" },
    update: {},
    create: {
      title: "Next.js 15の新機能と使い方ガイド",
      slug: "next-js-guide",
      excerpt: "Next.js 15で追加された新機能について詳しく解説します。App Routerの改善点やパフォーマンス向上について学びましょう。",
      content: `# Next.js 15の新機能

Next.js 15では多くの新機能が追加されました。

## 主な変更点

- App Routerの安定化
- パフォーマンスの向上
- TypeScriptサポートの強化

詳細な使い方について説明していきます。`,
      published: true,
      publishedAt: new Date(),
      featuredImage: "💻",
      createdById: user1.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: "design-system-basics" },
    update: {},
    create: {
      title: "デザインシステムの基礎と構築方法",
      slug: "design-system-basics",
      excerpt: "スケーラブルなプロダクト開発に欠かせないデザインシステム。その基礎から実践的な構築方法まで詳しく解説します。",
      content: `# デザインシステムとは

デザインシステムは、一貫性のあるユーザー体験を提供するための重要な仕組みです。

## 構成要素

- デザイントークン
- コンポーネントライブラリ
- ガイドライン

実際の構築手順を見ていきましょう。`,
      published: true,
      publishedAt: new Date(),
      featuredImage: "🎨",
      createdById: user2.id,
    },
  });

  // カテゴリとポストの関連付け
  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: {
        postId: post1.id,
        categoryId: techCategory.id,
      },
    },
    update: {},
    create: {
      postId: post1.id,
      categoryId: techCategory.id,
    },
  });

  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: {
        postId: post2.id,
        categoryId: designCategory.id,
      },
    },
    update: {},
    create: {
      postId: post2.id,
      categoryId: designCategory.id,
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
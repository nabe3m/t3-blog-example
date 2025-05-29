// カテゴリの型定義
export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	_count?: {
		posts: number;
	};
}

// カテゴリ（記事数付き）の型定義
export interface CategoryWithCount extends Category {
	_aggr_count_posts: number;
}

// ユーザーの型定義（最小限）
export interface User {
	id?: string;
	name: string | null;
	image: string | null;
	email?: string | null;
	role?: string | null;
}

// ユーザーの型定義（完全版）
export interface FullUser extends User {
	id: string;
	email: string | null;
	emailVerified: Date | null;
	role: string | null;
}

// 記事カテゴリの中間テーブル型定義
export interface PostCategory {
	id: number;
	postId: number;
	categoryId: number;
	category: Category;
}

// 記事の型定義
export interface Post {
	id: number;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	featuredImage: string | null;
	published: boolean;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	createdById: string;
	createdBy: User;
	categories?: PostCategory[];
	likes?: Like[];
	bookmarks?: Bookmark[];
}

// 記事フォームのデータ型
export interface PostFormData {
	title: string;
	content: string;
	excerpt: string;
	featuredImage?: string;
	categoryIds: number[];
	published: boolean;
}

// API レスポンス用のページネーション型
export interface PaginatedResponse<T> {
	items: T[];
	nextCursor?: string;
	hasMore: boolean;
}

// 記事一覧のページネーション型
export interface PostsResponse {
	posts: Post[];
	nextCursor?: string;
}

// いいねの型定義
export interface Like {
	id: number;
	postId: number;
	userId: string;
	createdAt: Date;
	user?: User;
	post?: Post;
}

// ブックマークの型定義
export interface Bookmark {
	id: number;
	postId: number;
	userId: string;
	createdAt: Date;
	user?: User;
	post?: Post;
}

// 統計情報付きの記事型
export interface PostWithStats extends Post {
	_count: {
		likes: number;
		bookmarks: number;
		categories: number;
	};
	isLikedByUser?: boolean;
	isBookmarkedByUser?: boolean;
} 
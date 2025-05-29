"use client";

import { useState } from "react";

interface ShareButtonsProps {
	title: string;
	url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	const shareOnX = () => {
		const text = encodeURIComponent(title);
		const shareUrl = encodeURIComponent(url);
		window.open(
			`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
			'_blank',
			'width=600,height=400'
		);
	};

	const shareOnFacebook = () => {
		const shareUrl = encodeURIComponent(url);
		window.open(
			`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
			'_blank',
			'width=600,height=400'
		);
	};

	const copyUrl = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('URLのコピーに失敗しました:', err);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-gray-600 mr-2">シェア:</span>
			
			{/* X (旧Twitter) */}
			<button
				onClick={shareOnX}
				className="flex items-center justify-center w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white transition-colors"
				title="Xでシェア"
			>
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>
			</button>

			{/* Facebook */}
			<button
				onClick={shareOnFacebook}
				className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
				title="Facebookでシェア"
			>
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
				</svg>
			</button>

			{/* URLコピー */}
			<button
				onClick={copyUrl}
				className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
					copied 
						? "bg-green-500 text-white" 
						: "bg-gray-200 hover:bg-gray-300 text-gray-600"
				}`}
				title="URLをコピー"
			>
				{copied ? (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				) : (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				)}
			</button>
		</div>
	);
} 
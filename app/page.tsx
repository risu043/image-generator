'use client';

import type React from 'react';

import { useState } from 'react';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OgImageGenerator() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedOgUrl, setGeneratedOgUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [color, setColor] = useState('#ffccff');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);

    // uploadされたファイルが画像ファイルかどうかをチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    // FileReader を使って画像ファイルを Base64のデータURL に変換
    // Base64（ベース64） とは、バイナリデータ（画像や音声、動画など）を、テキスト（文字列）に変換する方法
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      setGeneratedOgUrl(null);

      // new Image() を作成し、src に dataUrl を設定
      const img = new Image();
      // 画像の読み込み完了時に img.width と img.height を取得
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const generateOgImage = async () => {
    if (!previewImage || !originalWidth || !originalHeight) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: previewImage,
          width: originalWidth,
          height: originalHeight,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error('OG画像の生成に失敗しました');
      }

      // responseの画像（バイナリデータ）をBlob（バイナリデータを扱うためのオブジェクト）に変換
      const blob = await response.blob();
      // URL.createObjectURL(blob) を使って、Blob を 一時的なURL（Object URL） に変換
      const imageUrl = URL.createObjectURL(blob);

      setGeneratedOgUrl(imageUrl);
    } catch (error) {
      console.error('エラー:', error);
      setError(
        error instanceof Error ? error.message : '予期せぬエラーが発生しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        画像ジェネレーター
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>画像をアップロード</CardTitle>
            <CardDescription>
              デコレーションしたい画像をアップロードしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                クリックまたはドラッグ＆ドロップで画像をアップロード
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (最大10MB)</p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                デコレーションの色を選択
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    document.getElementById('color-picker')?.click()
                  }
                >
                  <input
                    id="color-picker"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <label htmlFor="color-picker" className="flex flex-col">
                  <span className="text-sm font-medium">
                    {color.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    クリックして色を変更
                  </span>
                </label>
              </div>
            </div>

            {error && <p>{error}</p>}

            {previewImage && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">プレビュー</h3>
                <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                </div>
                {originalWidth && originalHeight && (
                  <p className="text-xs text-gray-500 mt-2">
                    元のサイズ: {originalWidth} x {originalHeight}px
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={generateOgImage}
              disabled={!previewImage || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  画像を生成
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>生成された画像</CardTitle>
            <CardDescription>
              生成された画像がここに表示されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg aspect-[1.91/1] flex items-center justify-center overflow-hidden">
              {generatedOgUrl ? (
                <img
                  src={generatedOgUrl || '/placeholder.svg'}
                  alt="Generated OG Image"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {previewImage
                      ? '「OG画像を生成」ボタンをクリックしてください'
                      : '画像をアップロードしてください'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {generatedOgUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedOgUrl;
                  a.download = 'og-image.png';
                  a.click();
                }}
              >
                ダウンロード
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

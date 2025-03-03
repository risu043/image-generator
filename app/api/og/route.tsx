import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const {
      image,
      width: originalWidth,
      height: originalHeight,
      color,
    } = await request.json();

    if (!image) {
      return new Response('画像データが必要です', { status: 400 });
    }

    const width = originalWidth
      ? Number.parseInt(String(originalWidth), 10)
      : 1200;
    const height = originalHeight
      ? Number.parseInt(String(originalHeight), 10)
      : 630;

    return new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            height: '100%',
          }}
        >
          {/* 画像 */}
          <img
            src={image || '/placeholder.svg'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt="Generated image"
          />

          {/* テキストオーバーレイ */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              top: width / 8,
              right: height / 8,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={width / 4}
              height={width / 4}
              viewBox="0 0 199.999 191.594"
            >
              <path
                d="M111.954,169.675c-21,23.109-44.148,24.61-50.346,19.514h0c-5.073-4.172-5.22-8.039-5.054-11.958-3.677,1.369-7.4,2.424-12.936-1.113-6.763-4.321-12.494-26.8,3-53.913C18.146,109.378,9.568,87.821,12.5,80.35c2.4-6.114,6.032-7.448,9.811-8.5-2.438-3.074-4.592-6.289-2.939-12.647C21.39,51.434,41,39.037,71.574,45.4,74.975,14.355,92.825-.469,100.836.012h0c6.556.393,8.948,3.435,11.118,6.7,2.17-3.269,4.563-6.311,11.12-6.7,8.011-.48,25.861,14.345,29.262,45.386,30.573-6.359,50.184,6.039,52.2,13.805,1.652,6.357-.5,9.571-2.939,12.645,3.779,1.054,7.411,2.39,9.811,8.5,2.932,7.471-5.648,29.028-34.12,41.855,15.495,27.112,9.763,49.593,3,53.914-5.535,3.536-9.258,2.48-12.935,1.111.166,3.92.017,7.788-5.056,11.959-1.8,1.48-5.029,2.4-9.221,2.4C142.838,191.593,126.853,186.077,111.954,169.675Z"
                transform="translate(-11.955 0)"
                fill={color || '#fff'}
              />
            </svg>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (error) {
    console.error('OG画像生成エラー:', error);
    return new Response('OG画像の生成に失敗しました', { status: 500 });
  }
}

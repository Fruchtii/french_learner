import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(8, 12)">
            {/* Back card */}
            <rect
              x="6"
              y="6"
              width="40"
              height="32"
              rx="4"
              fill="#e2e8f0"
            />
            {/* Middle card */}
            <rect
              x="3"
              y="3"
              width="40"
              height="32"
              rx="4"
              fill="#cbd5e0"
            />
            {/* Front card */}
            <rect
              x="0"
              y="0"
              width="40"
              height="32"
              rx="4"
              fill="#1a202c"
            />
            {/* V letter (path, since ImageResponse can't render <text>) */}
            <path
              d="M14.1 9.1H17.2L20 18.4L22.8 9.1H25.9L21.5 22H18.5Z"
              fill="white"
            />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

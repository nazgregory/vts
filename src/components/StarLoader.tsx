import React from 'react';

interface StarLoaderProps {
  size?: number;
  gap?: number;
  speed?: number;
  className?: string;
}

const StarLoader: React.FC<StarLoaderProps> = ({ 
  size = 40, 
  gap = 16, 
  speed = 1.2,
  className = "" 
}) => {
  // 별 모양 SVG 컴포넌트
  const StarShape = ({ color, delay = 0 }: { color: string; delay?: number }) => (
    <div 
      className="star-shape"
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        animationDuration: `${speed}s`
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
      >
        {/* 5개 막대가 균등하게 퍼진 별 모양 */}
        <g>
          {/* 각 막대는 72도씩 회전 (360/5 = 72도) */}
          
          {/* 위쪽 막대 (0도) */}
          <rect
            x="44" y="15" 
            width="12" height="35"
            rx="6" ry="6"
            fill={color}
          />
          
          {/* 오른쪽 위 막대 (72도) */}
          <rect
            x="44" y="15" 
            width="12" height="35"
            rx="6" ry="6"
            fill={color}
            transform="rotate(72 50 50)"
          />
          
          {/* 오른쪽 아래 막대 (144도) */}
          <rect
            x="44" y="15" 
            width="12" height="35"
            rx="6" ry="6"
            fill={color}
            transform="rotate(144 50 50)"
          />
          
          {/* 왼쪽 아래 막대 (216도) */}
          <rect
            x="44" y="15" 
            width="12" height="35"
            rx="6" ry="6"
            fill={color}
            transform="rotate(216 50 50)"
          />
          
          {/* 왼쪽 위 막대 (288도) */}
          <rect
            x="44" y="15" 
            width="12" height="35"
            rx="6" ry="6"
            fill={color}
            transform="rotate(288 50 50)"
          />
        </g>
      </svg>
    </div>
  );

  return (
    <div 
      className={`star-loader ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: gap,
        padding: '10px'
      }}
    >
      <style>{`
        .star-shape {
          animation: star-pulse ${speed}s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes star-pulse {
          0%, 80%, 100% {
            transform: scale(0.7);
            opacity: 0.6;
          }
          40% {
            transform: scale(1.0);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .star-shape {
            animation: none !important;
            opacity: 0.8;
          }
        }
      `}</style>
      
      {/* 핑크 별 */}
      <StarShape color="#E91E63" delay={0} />
      
      {/* 파란 별 */}
      <StarShape color="#2196F3" delay={speed / 3} />
      
      {/* 초록 별 */}
      <StarShape color="#8BC34A" delay={(2 * speed) / 3} />
    </div>
  );
};

export default StarLoader;
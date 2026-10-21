import React, { useState, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTracking } from '../hooks/useTracking';
import { API_URL } from '../utils/apiConfig';

interface ChartSatisfactionRatingProps {
  chartId: string;
  chartType: string;
  isCustomized?: boolean;
  onRatingSubmit?: (rating: SatisfactionRating) => void;
  className?: string;
}

export interface SatisfactionRating {
  chartId: string;
  chartType: string;
  isCustomized: boolean;
  recommendation: 'recommend' | 'not_recommend';
  starRating: number; // 0-5, 0.5 단위
  timestamp: string;
}

const ChartSatisfactionRating: React.FC<ChartSatisfactionRatingProps> = ({
  chartId,
  chartType,
  isCustomized = false,
  onRatingSubmit,
  className = ''
}) => {
  const [recommendation, setRecommendation] = useState<'recommend' | 'not_recommend' | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { trackSatisfactionRating } = useTracking();

  const handleRecommendationClick = useCallback((type: 'recommend' | 'not_recommend') => {
    setRecommendation(type);
  }, []);

  const handleStarClick = useCallback((rating: number) => {
    setStarRating(rating);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!recommendation || starRating === 0) {
      alert('추천 여부와 별점을 모두 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const rating: SatisfactionRating = {
        chartId,
        chartType,
        isCustomized,
        recommendation,
        starRating,
        timestamp: new Date().toISOString()
      };

      // 만족도 평가 추적
      trackSatisfactionRating(rating);

      // API 호출 (백엔드에 저장)
      const response = await fetch(`${API_URL}/satisfaction-ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rating)
      });

      if (response.ok) {
        setIsSubmitted(true);
        onRatingSubmit?.(rating);
      } else {
        throw new Error('만족도 평가 저장 실패');
      }
    } catch (error) {
      console.error('만족도 평가 제출 실패:', error);
      alert('만족도 평가 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [chartId, chartType, isCustomized, recommendation, starRating, trackSatisfactionRating, onRatingSubmit]);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = starRating >= i;
      const isHalfFilled = starRating >= i - 0.5 && starRating < i;

      stars.push(
        <div key={i} className="relative">
          <button
            onClick={() => handleStarClick(i)}
            className="relative p-1 hover:scale-110 transition-transform"
            disabled={isSubmitted}
            title={`${i}점`}
          >
            <Star
              className={`w-6 h-6 ${
                isFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : isHalfFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
          
          {/* 반쪽 별 클릭 영역 (왼쪽 절반) */}
          <button
            onClick={() => handleStarClick(i - 0.5)}
            className="absolute inset-0 p-1 hover:scale-110 transition-transform"
            disabled={isSubmitted}
            style={{ 
              width: '50%', 
              left: 0,
              background: 'transparent',
              cursor: 'pointer'
            }}
            title={`${i - 0.5}점`}
          >
            <div className="w-full h-full"></div>
          </button>
          
          {/* 반쪽 별 시각적 표시 - 오른쪽 절반을 흰색으로 가림 */}
          {isHalfFilled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-6 bg-white rounded-r-full ml-3"></div>
            </div>
          )}
        </div>
      );
    }
    return stars;
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center text-green-600">
          <Star className="w-5 h-5 mr-2 fill-current" />
          <span className="font-medium">만족도 평가가 완료되었습니다!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          생성된 차트에 대한 만족도를 평가해주세요
        </h4>
        
        {/* 추천/비추천 버튼 */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleRecommendationClick('recommend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              recommendation === 'recommend'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            disabled={isSubmitting}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>추천</span>
          </button>
          <button
            onClick={() => handleRecommendationClick('not_recommend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              recommendation === 'not_recommend'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            disabled={isSubmitting}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>비추천</span>
          </button>
        </div>

        {/* 별점 평가 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">별점 (0.5점 단위)</p>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-500">
              {starRating > 0 ? `${starRating}/5` : '0/5'}
            </span>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!recommendation || starRating === 0 || isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '제출 중...' : '만족도 평가 제출'}
        </button>
      </div>
    </div>
  );
};

export default ChartSatisfactionRating;

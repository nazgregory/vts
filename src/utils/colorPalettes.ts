import colorPalettesData from '../../json/color_palettes.json';

// 색상 팔레트 타입
export interface ColorPalette {
  description: string;
  colors: string[];
}

export interface ColorPalettes {
  color_palettes: {
    under_10: ColorPalette;
    '12_colors': ColorPalette;
    '16_colors': ColorPalette;
    '18_colors': ColorPalette;
    '25_colors': ColorPalette;
  };
}

// 색상 팔레트 가져오기
export const getColorPalette = (paletteName: keyof ColorPalettes['color_palettes']): string[] => {
  return colorPalettesData.color_palettes[paletteName]?.colors || [];
};

// 데이터 개수에 따른 적절한 색상 팔레트 반환
export const getColorPaletteByDataCount = (dataCount: number): string[] => {
  if (dataCount <= 10) {
    return getColorPalette('under_10');
  } else if (dataCount <= 12) {
    return getColorPalette('12_colors');
  } else if (dataCount <= 16) {
    return getColorPalette('16_colors');
  } else if (dataCount <= 18) {
    return getColorPalette('18_colors');
  } else {
    return getColorPalette('25_colors');
  }
};

// 브랜드 색상 팔레트 (기본)
export const getBrandColors = (): string[] => {
  return [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];
};

// 무지개 색상 팔레트
export const getRainbowColors = (): string[] => {
  return [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF', // Blue
    '#4B0082', // Indigo
    '#9400D3', // Violet
    '#FF1493', // Deep Pink
    '#00CED1', // Dark Turquoise
    '#32CD32'  // Lime Green
  ];
};

// 사용자 정의 색상 검증
export const validateCustomColors = (colors: string[]): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colors.every(color => hexColorRegex.test(color));
};

// 색상 팔레트 이름 가져오기
export const getPaletteDisplayName = (paletteName: string): string => {
  const names: Record<string, string> = {
    'brand': '10색 조합',
    'rainbow': '무지개색 조합',
    'reference18': '행정동 조합',
    'custom': '사용자 정의'
  };
  return names[paletteName] || paletteName;
};

// 색상 팔레트 키 매핑
export const getPaletteKey = (displayName: string): keyof ColorPalettes['color_palettes'] => {
  const mapping: Record<string, keyof ColorPalettes['color_palettes']> = {
    'brand': 'under_10',
    'rainbow': '12_colors',
    'reference18': '18_colors',
    'custom': 'under_10'
  };
  return mapping[displayName] || 'under_10';
};

// 색상 팔레트 설명 가져오기
export const getPaletteDescription = (paletteName: string): string => {
  const descriptions: Record<string, string> = {
    'brand': '브랜드 아이덴티티에 맞는 전문적인 색상 조합',
    'rainbow': '다양하고 생동감 있는 색상 조합',
    'reference18': '서초구 동별 색상 매핑을 위한 18색상 팔레트',
    'custom': '사용자가 직접 정의한 색상 조합'
  };
  return descriptions[paletteName] || '';
};

// 색상 대비 계산 (접근성 검증용)
export const calculateColorContrast = (color1: string, color2: string): number => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const luminance1 = 0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b;
  const luminance2 = 0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b;

  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// 접근성 기준 충족 여부 확인
export const isAccessibleContrast = (color1: string, color2: string): boolean => {
  const contrast = calculateColorContrast(color1, color2);
  return contrast >= 4.5; // WCAG AA 기준
};

// 색상 팔레트 접근성 검증
export const validatePaletteAccessibility = (colors: string[], backgroundColor: string = '#FFFFFF'): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  let isValid = true;

  // 배경색과의 대비 검증
  colors.forEach((color, index) => {
    const contrast = calculateColorContrast(color, backgroundColor);
    if (contrast < 4.5) {
      issues.push(`색상 ${index + 1} (${color})이 배경색과 충분한 대비를 가지지 않습니다. 대비율: ${contrast.toFixed(2)}`);
      isValid = false;
    }
  });

  // 색상 간 구분 검증
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const contrast = calculateColorContrast(colors[i], colors[j]);
      if (contrast < 3.0) {
        issues.push(`색상 ${i + 1}과 ${j + 1}이 서로 구분하기 어렵습니다. 대비율: ${contrast.toFixed(2)}`);
        isValid = false;
      }
    }
  }

  return { isValid, issues };
};

// 지도 시각화를 위한 카테고리별 색상 매핑 생성
export const createCategoryColorMap = (
  categories: string[], 
  paletteType: 'brand' | 'rainbow' | 'reference18' | 'custom' = 'brand',
  customColors?: string[],
  seriesColors?: Record<string, string>
): Record<string, string> => {
  let colorPalette: string[] = [];

  // 색상 팔레트 선택에 따른 색상 배열 생성
  switch (paletteType) {
    case 'brand':
      colorPalette = getBrandColors();
      break;
    case 'rainbow':
      colorPalette = getRainbowColors();
      break;
    case 'reference18':
      colorPalette = getColorPalette('18_colors');
      break;
    case 'custom':
      colorPalette = customColors || getBrandColors();
      break;
    default:
      colorPalette = getBrandColors();
  }

  // 카테고리별 색상 매핑 생성
  const colorMapping: Record<string, string> = {};
  
  categories.forEach((category, index) => {
    // seriesColors에 특정 카테고리 색상이 지정되어 있으면 사용
    if (seriesColors && seriesColors[category]) {
      colorMapping[category] = seriesColors[category];
    } else {
      // 색상 팔레트에서 순차적으로 색상 할당
      const colorIndex = index % colorPalette.length;
      colorMapping[category] = colorPalette[colorIndex];
    }
  });

  return colorMapping;
};

// 색상 팔레트 미리보기 생성 (UI에서 사용)
export const generatePalettePreview = (
  paletteType: 'brand' | 'rainbow' | 'reference18' | 'custom',
  customColors?: string[]
): string[] => {
  switch (paletteType) {
    case 'brand':
      return getBrandColors();
    case 'rainbow':
      return getRainbowColors();
    case 'reference18':
      return getColorPalette('18_colors');
    case 'custom':
      return customColors || getBrandColors();
    default:
      return getBrandColors();
  }
};

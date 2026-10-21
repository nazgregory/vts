import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChartData, ChartCustomization } from '../types';
import StarLoader from './StarLoader';
import { createCategoryColorMap } from '../utils/colorPalettes';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/vendor/leaflet/marker-icon-2x.png',
  iconUrl: '/vendor/leaflet/marker-icon.png',
  shadowUrl: '/vendor/leaflet/marker-shadow.png',
});

interface MapChartProps {
  data: ChartData[];
  customization: ChartCustomization;
  width?: number;
  height?: number;
}

interface LocationData {
  address: string;
  name: string;
  description: string;
  category: string;
  priority?: string;
  status?: string;
  rating?: number;
  businessHours?: string;
  lat?: number;
  lng?: number;
}

function readCoordinate(item: ChartData, keys: string[]): number | undefined {
  for (const key of keys) {
    const raw = item[key];
    if (raw === undefined || raw === null || raw === '') {
      continue;
    }
    const value = Number(raw);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

const MapChart: React.FC<MapChartProps> = ({
  data,
  customization,
  width = 800,
  height = 500
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const kakaoApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY || '';

  // 동적 색상 팔레트 생성
  const categoryColorMap = useMemo(() => {
    if (!customization?.common?.colors) {
      return {};
    }

    const { palette, customColors, seriesColors } = customization.common.colors;
    const uniqueCategories = [...new Set(locations.map(loc => loc.category))];
    
    const colorMap = createCategoryColorMap(uniqueCategories, palette, customColors, seriesColors);
    
    // 디버깅: 색상 매핑 로그
    console.log('MapChart 색상 팔레트 업데이트:', {
      palette,
      customColors,
      seriesColors,
      uniqueCategories,
      colorMap
    });
    
    return colorMap;
  }, [customization?.common?.colors, locations]);

  // 주소를 위경도로 변환하는 함수
  const geocodeAddress = useCallback(async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!kakaoApiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${kakaoApiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('주소 변환 실패');
      }

      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const { x, y } = data.documents[0];
        return { lng: parseFloat(x), lat: parseFloat(y) };
      }
      
      return null;
    } catch (error) {
      console.error('주소 변환 오류:', error);
      return null;
    }
  }, [kakaoApiKey]);

  // 지도 정리 함수
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.log('지도 정리 중 오류 (무시됨):', error);
      }
    }
  }, []);

  // 타일 레이어 업데이트 함수
  const updateTileLayer = useCallback((map: L.Map, basemapType: string) => {
    // 기존 타일 레이어 제거
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // 새로운 타일 레이어 추가
    const internalTileUrl = import.meta.env.VITE_MAP_TILE_URL || '';
    let tileLayerUrl: string;
    let attribution: string;

    if (internalTileUrl) {
      tileLayerUrl = internalTileUrl;
      attribution = '';
    } else if (basemapType === 'simplified') {
      tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution = '© CartoDB, © OpenStreetMap contributors';
    } else {
      tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '© OpenStreetMap contributors';
    }
    
    L.tileLayer(tileLayerUrl, {
      attribution: attribution
    }).addTo(map);
  }, []);

  // 데이터 처리 및 주소 변환
  useEffect(() => {
    const processData = async () => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const locationData: LocationData[] = [];

        for (const item of data) {
          const address = String(item['주소'] || item['address'] || '');
          const lat = readCoordinate(item, ['위도', 'lat', 'latitude']);
          const lng = readCoordinate(item, ['경도', 'lng', 'lon', 'longitude']);
          const hasCoordinates = lat !== undefined && lng !== undefined;

          if (!address && !hasCoordinates) {
            continue;
          }

          const coords = hasCoordinates
            ? { lat, lng }
            : await geocodeAddress(address);

          locationData.push({
            address,
            name: String(item['서비스명'] || item['매장명'] || item['name'] || ''),
            description: String(item['설명'] || item['서비스'] || item['description'] || ''),
            category: String(item['카테고리'] || item['category'] || ''),
            priority: item['우선순위'] || item['priority'] ? String(item['우선순위'] || item['priority']) : undefined,
            status: item['상태'] || item['status'] ? String(item['상태'] || item['status']) : undefined,
            rating: item['평점'] || item['rating'] ? parseFloat(String(item['평점'] || item['rating'])) : undefined,
            businessHours: item['영업시간'] || item['businessHours'] ? String(item['영업시간'] || item['businessHours']) : undefined,
            lat: coords?.lat,
            lng: coords?.lng
          });
        }

        if (locationData.length > 0 && locationData.every((location) => location.lat === undefined || location.lng === undefined)) {
          setError(
            kakaoApiKey
              ? '주소를 좌표로 바꾸지 못했습니다. 위도, 경도 열을 넣거나 주소를 확인해 주세요.'
              : '위도, 경도 열이 없습니다. 열을 추가하거나 VITE_KAKAO_REST_API_KEY를 설정하세요.'
          );
        }

        setLocations(locationData);
        setLoading(false);
      } catch (error) {
        console.error('데이터 처리 오류:', error);
        setError('데이터 처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    processData();
  }, [data, geocodeAddress, kakaoApiKey]);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!mapRef.current || !locations.length || loading) return;

    // 기존 지도 인스턴스 정리
    cleanupMap();

    // 유효한 좌표가 있는 위치들만 필터링
    const validLocations = locations.filter(loc => loc.lat && loc.lng);
    
    if (validLocations.length === 0) {
      return;
    }

    // 지도 중심점 계산
    const centerLat = validLocations.reduce((sum, loc) => sum + (loc.lat || 0), 0) / validLocations.length;
    const centerLng = validLocations.reduce((sum, loc) => sum + (loc.lng || 0), 0) / validLocations.length;

    try {
      // 지도 생성
      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // 베이스맵 설정에 따른 타일 레이어 추가
      const basemapType = customization?.map?.basemap?.type || 'default';
      updateTileLayer(map, basemapType);

      // 마커 추가
      validLocations.forEach((location) => {
        if (location.lat && location.lng) {
          const marker = L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #2563eb; font-size: 16px;">${location.name}</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>주소:</strong> ${location.address}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>설명:</strong> ${location.description}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>카테고리:</strong> ${location.category}</p>
                ${location.priority ? `<p style="margin: 4px 0; font-size: 14px;"><strong>우선순위:</strong> ${location.priority}</p>` : ''}
                ${location.status ? `<p style="margin: 4px 0; font-size: 14px;"><strong>상태:</strong> ${location.status}</p>` : ''}
                ${location.rating ? `<p style="margin: 4px 0; font-size: 14px;"><strong>평점:</strong> ${location.rating}/5.0</p>` : ''}
                ${location.businessHours ? `<p style="margin: 4px 0; font-size: 14px;"><strong>영업시간:</strong> ${location.businessHours}</p>` : ''}
              </div>
            `);

          // 커스터마이징된 색상 적용
          const color = categoryColorMap[location.category] || '#6b7280';
          marker.setIcon(
            L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          );
        }
      });

      // 범례 추가
      const legend = (L as any).control({ position: 'bottomright' });
      (legend as any).onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        div.style.fontSize = '12px';
        div.style.maxHeight = '300px';
        div.style.overflowY = 'auto';
        
        const categories = [...new Set(validLocations.map(loc => loc.category))];
        let legendHTML = '<h4 style="margin: 0 0 10px 0;">카테고리</h4>';
        
        // 범례 순서를 색상 팔레트 순서에 맞춰 정렬
        const sortedCategories = categories.sort((a, b) => {
          const aIndex = Object.keys(categoryColorMap).indexOf(a);
          const bIndex = Object.keys(categoryColorMap).indexOf(b);
          return aIndex - bIndex;
        });
        
        sortedCategories.forEach(category => {
          const color = categoryColorMap[category] || '#6b7280';
          legendHTML += `
            <div style="display: flex; align-items: center; margin: 5px 0;">
              <div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; border: 1px solid #ccc;"></div>
              <span>${category}</span>
            </div>
          `;
        });
        
        div.innerHTML = legendHTML;
        return div;
      };
      legend.addTo(map);

    } catch (error) {
      console.error('지도 초기화 오류:', error);
      setError('지도 초기화 중 오류가 발생했습니다.');
    }

  }, [locations, loading, cleanupMap, categoryColorMap]);

  // 지도 스타일 변경 시 타일 레이어 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && !loading) {
      const basemapType = customization?.map?.basemap?.type || 'default';
      updateTileLayer(mapInstanceRef.current, basemapType);
    }
  }, [customization?.map?.basemap?.type, loading, updateTileLayer]);

  // 컴포넌트 언마운트 시 지도 정리
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  if (loading) {
    return (
      <div className="chart-container bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center" style={{ width, height }}>
        <div className="text-gray-500">
          <StarLoader size={32} speed={1.0} gap={16} />
          <p className="mt-4">지도 데이터를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center" style={{ width, height }}>
        <div className="text-red-500">
          <p>오류: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center" style={{ width, height }}>
        <div className="text-gray-500">
          <p>지도 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container flex items-center justify-center" style={{ width, height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default MapChart; 
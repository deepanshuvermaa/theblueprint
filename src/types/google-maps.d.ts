// Google Maps TypeScript type declarations
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setPath(path: LatLng[]): void;
      setMap(map: Map | null): void;
    }

    interface PolylineOptions {
      path?: LatLng[];
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain',
    }

    namespace visualization {
      class HeatmapLayer {
        constructor(opts?: HeatmapLayerOptions);
        setMap(map: Map | null): void;
      }

      interface HeatmapLayerOptions {
        data: LatLng[];
        map?: Map;
        radius?: number;
        opacity?: number;
      }
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

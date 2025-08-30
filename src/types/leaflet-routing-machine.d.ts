declare module 'leaflet-routing-machine' {
  import * as L from 'leaflet';

  namespace Routing {
    interface RoutingOptions {
      waypoints?: L.LatLng[];
      router?: unknown;
      plan?: unknown;
      lineOptions?: unknown;
      show?: boolean;
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      fitSelectedRoutes?: boolean;
      createMarker?: (index: number, waypoint: unknown, numberOfWaypoints: number) => L.Marker | null;
    }

    class Control extends L.Control {
      constructor(options?: RoutingOptions);
      setWaypoints(waypoints: L.LatLng[]): this;
      spliceWaypoints(index: number, waypoints: L.LatLng[]): this;
      getPlan(): unknown;
      getRouter(): unknown;
    }

    function control(options?: RoutingOptions): Control;
  }

  export = Routing;
}
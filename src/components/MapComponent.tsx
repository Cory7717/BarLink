"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { logAnalyticsEvent } from "@/lib/analytics";

type Bar = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  hasNew?: boolean;
  hasSpecial?: boolean;
};

export type MapComponentProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  bars: Bar[];
};

export default function MapComponent({ latitude, longitude, zoom, bars }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [longitude, latitude],
      zoom: zoom,
    });

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom]);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    bars.forEach((bar) => {
      const el = document.createElement("div");
      const pinClass = bar.hasNew ? "map-pin map-pin--new" : bar.hasSpecial ? "map-pin map-pin--special" : "map-pin";
      el.className = pinClass;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Open ${bar.name} profile`);
      el.tabIndex = 0;
      el.innerHTML = '<span class="map-pin__dot"></span>';

      const handleClick = () => {
        logAnalyticsEvent(bar.id, "profile_click", "map");
        router.push(`/bars/${bar.slug}`);
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bar.longitude, bar.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="map-popup">
              <div class="map-popup__title">${bar.name}</div>
              <div class="map-popup__meta">Tap to open profile</div>
            </div>`
          )
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [bars, router]);

  return <div ref={mapContainer} className="h-full w-full rounded-xl" />;
}

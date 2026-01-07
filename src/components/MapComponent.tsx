"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Bar = {
  id: string;
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
      style: "mapbox://styles/mapbox/dark-v11",
      center: [longitude, latitude],
      zoom: zoom,
    });

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers for bars
    bars.forEach((bar) => {
      const el = document.createElement("div");
      el.className = "w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg cursor-pointer hover:bg-emerald-400 transition flex items-center justify-center text-white font-bold text-sm";
      el.textContent = bar.hasNew ? "N" : bar.hasSpecial ? "S" : "•";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bar.longitude, bar.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="text-slate-900 font-semibold">${bar.name}</div>`
          )
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [bars]);

  return <div ref={mapContainer} className="h-full w-full rounded-xl" />;
}

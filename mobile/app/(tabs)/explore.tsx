import React, { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { BarSearchResult } from "@barlink/shared";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExploreScreen() {
  const [day, setDay] = useState<number>(new Date().getDay());
  const [activity, setActivity] = useState<string>("trivia");
  const [city, setCity] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["search", { day, activity, city, keyword }],
    queryFn: async () =>
      api.searchBars({
        day,
        activity,
        city: city.trim() || undefined,
        q: keyword.trim() || undefined,
      }),
  });

  const header = useMemo(
    () => (
      <View style={styles.filters}>
        <Text style={styles.heading}>Find the right night</Text>
        <Text style={styles.subheading}>Search by day, activity, and city</Text>
        <View style={styles.dayRow}>
          {days.map((label, index) => (
            <Pressable
              key={label}
              onPress={() => setDay(index)}
              style={[styles.dayChip, day === index && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipText, day === index && styles.dayChipTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          placeholder="Activity (e.g. trivia, karaoke, live music)"
          placeholderTextColor="#9ca3af"
          value={activity}
          onChangeText={setActivity}
          style={styles.input}
        />
        <TextInput
          placeholder="City (optional)"
          placeholderTextColor="#9ca3af"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <TextInput
          placeholder="Keyword (optional)"
          placeholderTextColor="#9ca3af"
          value={keyword}
          onChangeText={setKeyword}
          style={styles.input}
        />
        <Pressable style={styles.searchButton} onPress={() => refetch()}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>
    ),
    [activity, city, day, keyword, refetch]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        ListHeaderComponent={header}
        renderItem={({ item }) => <BarCard bar={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          isFetching ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#00d4ff" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>No bars found yet.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

function BarCard({ bar }: { bar: BarSearchResult }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{bar.name}</Text>
      <Text style={styles.cardSubtitle}>
        {bar.address}, {bar.city}
      </Text>
      <View style={styles.offeringPills}>
        {bar.todayOfferings.slice(0, 4).map((offering) => (
          <View key={offering} style={styles.pill}>
            <Text style={styles.pillText}>{offering}</Text>
          </View>
        ))}
      </View>
      <View style={styles.metaRow}>
        {bar.hasSpecial && <Text style={styles.meta}>Specials</Text>}
        {bar.hasNew && <Text style={styles.meta}>New</Text>}
        {bar.distance !== undefined && (
          <Text style={styles.meta}>{bar.distance.toFixed(1)} mi</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050915",
  },
  filters: {
    padding: 20,
    gap: 10,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  subheading: {
    color: "#9ca3af",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  dayChipActive: {
    backgroundColor: "#00d4ff",
  },
  dayChipText: {
    color: "white",
    fontWeight: "600",
  },
  dayChipTextActive: {
    color: "#0b1221",
  },
  input: {
    backgroundColor: "#0f172a",
    color: "white",
    padding: 12,
    borderRadius: 12,
    borderColor: "#1f2937",
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: "#00d4ff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  searchButtonText: {
    fontWeight: "700",
    color: "#0b1221",
  },
  card: {
    backgroundColor: "#0f172a",
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderColor: "#1f2937",
    borderWidth: 1,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#9ca3af",
    marginTop: 2,
    marginBottom: 8,
  },
  offeringPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pillText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  meta: {
    color: "#93c5fd",
    fontSize: 12,
  },
  loading: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
    marginTop: 8,
  },
});

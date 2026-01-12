import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import type { BarSummary } from "@barlink/shared";

export default function AccountScreen() {
  const { owner, login, logout, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: bars } = useQuery({
    queryKey: ["owner-bars"],
    queryFn: () => api.ownerBars(),
    enabled: !!owner,
  });

  const handleLogin = async () => {
    try {
      setError(null);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  if (!owner) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Owner Login</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
        <Text style={styles.caption}>Uses the same account as the web dashboard.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi, {owner.name}</Text>
      <Text style={styles.subtitle}>{owner.email}</Text>
      {owner.subscription ? (
        <Text style={styles.meta}>
          Plan: {owner.subscription.plan} · Status: {owner.subscription.status}
        </Text>
      ) : (
        <Text style={styles.meta}>No active subscription</Text>
      )}

      <FlatList
        data={bars || []}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => <BarRow bar={item} />}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Your Bars</Text>}
        ListEmptyComponent={<Text style={styles.caption}>No bars yet.</Text>}
      />

      <Pressable style={[styles.button, styles.secondaryButton]} onPress={logout}>
        <Text style={styles.secondaryText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

function BarRow({ bar }: { bar: BarSummary }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barTitle}>{bar.name}</Text>
      <Text style={styles.barSubtitle}>
        {bar.address}, {bar.city}, {bar.state}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050915",
    padding: 24,
    gap: 12,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#cbd5e1",
  },
  meta: {
    color: "#9ca3af",
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#0f172a",
    color: "white",
    padding: 12,
    borderRadius: 12,
    borderColor: "#1f2937",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#00d4ff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#0b1221",
    fontWeight: "700",
  },
  caption: {
    color: "#9ca3af",
  },
  error: {
    color: "#f87171",
  },
  barRow: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    borderColor: "#1f2937",
    borderWidth: 1,
    marginBottom: 10,
  },
  barTitle: {
    color: "white",
    fontWeight: "700",
  },
  barSubtitle: {
    color: "#9ca3af",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: "#1f2937",
    borderWidth: 1,
  },
  secondaryText: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
});

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Theme } from '../../constants/Theme';
import { Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { EventCard } from '../../components/EventCard';
import { useRouter } from 'expo-router';
import { fetchAllEvents, getStoredUser, fetchMyEvents, UnifiedEvent } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [subscribedEventIds, setSubscribedEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    try {
      const [evts, user, myEvts] = await Promise.all([
        fetchAllEvents(),
        getStoredUser(),
        fetchMyEvents().catch(() => []) // Catch auth error if not logged in
      ]);
      setEvents(evts.filter((e: UnifiedEvent) => {
        if (!e.endDate) return true; // No end date = always visible
        return new Date(e.endDate).getTime() > Date.now();
      }));
      if (myEvts && Array.isArray(myEvts)) {
        setSubscribedEventIds(new Set(myEvts.map((e: any) => String(e.id))));
      }
      if (user?.name) setUserName(user.name);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  // Build unique days from events
  const uniqueDays = events
    .filter(e => e.dateString && e.dateString !== '--/--')
    .reduce<{ id: string; day: string; month: string; weekDay: string }[]>((acc, e) => {
      if (!acc.find(d => d.id === e.dateString) && e.date) {
        const d = new Date(e.date);
        acc.push({
          id: e.dateString,
          day: String(d.getDate()).padStart(2, '0'),
          month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').substring(0, 3).toUpperCase(),
          weekDay: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').substring(0, 3).toUpperCase(),
        });
      }
      return acc;
    }, []);

  const filteredEvents = (selectedDay === 'TODOS' ? events : events.filter(e => e.dateString === selectedDay))
    .filter(e => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
    });

  const renderItem = useCallback(({ item }: { item: UnifiedEvent }) => (
    <EventCard
      key={item.id}
      title={item.title}
      subtitle={item.subtitle}
      time={item.time}
      location={item.location}
      highlighted={subscribedEventIds.has(String(item.id))}
      attendeesCount={item.attendeesCount}
      eventType={item.type}
      onPress={() => router.push(`/event/${item.id}?type=${item.type}`)}
    />
  ), [router, subscribedEventIds]);

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={{ color: Colors.gray, marginTop: 16, fontSize: 14 }}>Carregando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatarBorder}>
              <Avatar size={48} initials={userName.substring(0, 2).toUpperCase()} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Bem-vindo(a)</Text>
              <Text style={styles.nameText}>{userName}</Text>
            </View>
            <View style={styles.notificationButton}>
              <Feather name="bell" size={24} color={Colors.white} />
              <View style={styles.notificationBadge} />
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Sidebar Calendar */}
          <View style={styles.calendarSidebar}>
            <TouchableOpacity onPress={() => setSelectedDay('TODOS')} activeOpacity={0.7}>
              <Text style={[styles.monthText, selectedDay === 'TODOS' && { color: Colors.white }]}>TODOS</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
              {uniqueDays.map((d) => {
                const isActive = selectedDay === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDay(d.id)}
                    style={isActive ? styles.dayItemActive : styles.dayItem}
                  >
                    <Text style={isActive ? styles.dayNumberActive : styles.dayNumber}>{d.day}</Text>
                    <Text style={[isActive ? styles.dayNameActive : styles.dayName, { fontSize: 13, fontWeight: '800' }]}>{d.month}</Text>
                    <Text style={[isActive ? styles.dayNameActive : styles.dayName, { opacity: 0.6, marginTop: 2 }]}>{d.weekDay}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* List Area */}
          <View style={styles.listArea}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={Colors.green} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar eventos..."
                placeholderTextColor={Colors.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredEvents}
              renderItem={renderItem}
              keyExtractor={item => `${item.type}-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} colors={[Colors.green]} />
              }
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: Theme.spacing.xxxl }}>
                  <Text style={{ color: Colors.gray, fontSize: 16 }}>Nenhum evento encontrado.</Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.black },
  container: { flex: 1 },
  header: { paddingHorizontal: Theme.spacing.l, paddingTop: Theme.spacing.l, paddingBottom: Theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.cardBg },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBorder: { borderWidth: 2, borderColor: Colors.green, borderRadius: 100, padding: 2, marginRight: Theme.spacing.m },
  headerTextContainer: { flex: 1 },
  welcomeText: { color: Colors.green, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  nameText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  notificationButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  mainContent: { flex: 1, flexDirection: 'row' },
  calendarSidebar: { width: 80, paddingVertical: Theme.spacing.xl, alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.cardBg },
  monthText: { color: Colors.green, fontWeight: '700', fontSize: 14, marginBottom: Theme.spacing.xxl },
  calendarScroll: { alignItems: 'center', paddingBottom: 40 },
  dayItem: { alignItems: 'center', marginBottom: Theme.spacing.xxl },
  dayNumber: { color: Colors.gray, fontSize: 20, fontWeight: '700' },
  dayName: { color: Colors.gray, fontSize: 10, marginTop: 4 },
  dayItemActive: { backgroundColor: Colors.green, borderRadius: Theme.borderRadius.xlarge, paddingVertical: Theme.spacing.l, paddingHorizontal: Theme.spacing.s, alignItems: 'center', marginBottom: Theme.spacing.xxl },
  dayNumberActive: { color: Colors.black, fontSize: 20, fontWeight: '800' },
  dayNameActive: { color: Colors.black, fontSize: 10, marginTop: 4, fontWeight: '600' },
  listArea: { flex: 1, paddingHorizontal: Theme.spacing.l, paddingTop: Theme.spacing.xl },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.greenDim, borderRadius: Theme.borderRadius.round, paddingHorizontal: Theme.spacing.l, height: 48, marginBottom: Theme.spacing.xl },
  searchInput: { flex: 1, color: Colors.white, marginLeft: Theme.spacing.s, fontSize: 16 },
  listContent: { paddingBottom: 100 },
});

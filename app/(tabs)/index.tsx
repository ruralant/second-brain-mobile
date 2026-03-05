import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { deleteFeed, getAllFeeds, getFeedArticleCount } from '@/db/feeds';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { refreshFeed } from '@/services/rss';
import type { Feed } from '@/types';

type FeedWithCount = Feed & { articleCount: number };

export default function FeedsScreen() {
  const [feeds, setFeeds] = useState<FeedWithCount[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const loadFeeds = useCallback(() => {
    const allFeeds = getAllFeeds();
    const feedsWithCount = allFeeds.map((feed) => ({
      ...feed,
      articleCount: getFeedArticleCount(feed.id),
    }));
    setFeeds(feedsWithCount);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeeds();
    }, [loadFeeds])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const allFeeds = getAllFeeds();
      await Promise.all(allFeeds.map((feed) => refreshFeed(feed.id)));
      loadFeeds();
    } catch {
      Alert.alert('Error', 'Failed to refresh some feeds.');
    } finally {
      setRefreshing(false);
    }
  }, [loadFeeds]);

  const handleDelete = useCallback(
    (feed: Feed) => {
      Alert.alert('Delete Feed', `Remove "${feed.title}" and all its articles?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFeed(feed.id);
            loadFeeds();
          },
        },
      ]);
    },
    [loadFeeds]
  );

  const renderFeed = useCallback(
    ({ item }: { item: FeedWithCount }) => (
      <Pressable
        style={({ pressed }) => [
          styles.feedItem,
          { backgroundColor: pressed ? Colors[colorScheme].tint + '10' : 'transparent' },
        ]}
        onPress={() => router.push(`/feed/${item.id}`)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.feedInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText numberOfLines={2} style={styles.feedDescription}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.feedMeta}>
          <ThemedText style={styles.articleCount}>{item.articleCount}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
        </View>
      </Pressable>
    ),
    [colorScheme, handleDelete]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={feeds}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderFeed}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={feeds.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={64} color={Colors[colorScheme].icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No feeds yet
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Add your first RSS feed to start reading
            </ThemedText>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/add-feed')}
            >
              <ThemedText style={styles.emptyButtonText}>Add Feed</ThemedText>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: Colors[colorScheme].icon + '20' }]} />
        )}
      />
      {feeds.length > 0 && (
        <Pressable
          style={[styles.fab, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={() => router.push('/add-feed')}
        >
          <IconSymbol name="plus" size={28} color="#fff" />
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  feedInfo: {
    flex: 1,
    marginRight: 12,
  },
  feedDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  feedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleCount: {
    fontSize: 14,
    opacity: 0.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

import { useLocalSearchParams } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
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
import { getArticlesByFeed, markAsRead, toggleSaveArticle } from '@/db/articles';
import { getFeedById } from '@/db/feeds';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { refreshFeed } from '@/services/rss';
import type { Article } from '@/types';

export default function FeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const feedId = Number(id);
  const feed = getFeedById(feedId);
  const [articles, setArticles] = useState<Article[]>(() => getArticlesByFeed(feedId));
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const loadArticles = useCallback(() => {
    setArticles(getArticlesByFeed(feedId));
  }, [feedId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFeed(feedId);
      loadArticles();
    } catch {
      // Silently fail on refresh — articles stay as-is
    } finally {
      setRefreshing(false);
    }
  }, [feedId, loadArticles]);

  const handleOpenArticle = useCallback(
    async (article: Article) => {
      markAsRead(article.id);
      loadArticles();
      if (article.url) {
        await openBrowserAsync(article.url, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      }
    },
    [loadArticles]
  );

  const handleToggleSave = useCallback(
    (article: Article) => {
      toggleSaveArticle(article.id);
      loadArticles();
    },
    [loadArticles]
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderArticle = useCallback(
    ({ item }: { item: Article }) => (
      <Pressable
        style={({ pressed }) => [
          styles.articleItem,
          { backgroundColor: pressed ? Colors[colorScheme].tint + '10' : 'transparent' },
        ]}
        onPress={() => handleOpenArticle(item)}
      >
        <View style={styles.articleRow}>
          <View style={styles.articleContent}>
            <View style={styles.titleRow}>
              {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: Colors[colorScheme].tint }]} />
              )}
              <ThemedText
                type="defaultSemiBold"
                numberOfLines={2}
                style={[styles.articleTitle, item.isRead && styles.readTitle]}
              >
                {item.title}
              </ThemedText>
            </View>
            {item.description ? (
              <ThemedText numberOfLines={2} style={styles.articleDescription}>
                {item.description}
              </ThemedText>
            ) : null}
            {item.pubDate ? (
              <ThemedText style={styles.pubDate}>{formatDate(item.pubDate)}</ThemedText>
            ) : null}
          </View>
          <Pressable
            onPress={() => handleToggleSave(item)}
            hitSlop={8}
            style={styles.bookmarkButton}
          >
            <IconSymbol
              name={item.isSaved ? 'bookmark.fill' : 'bookmark'}
              size={22}
              color={item.isSaved ? Colors[colorScheme].tint : Colors[colorScheme].icon}
            />
          </Pressable>
        </View>
      </Pressable>
    ),
    [colorScheme, handleOpenArticle, handleToggleSave]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderArticle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={articles.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={48} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.emptyText}>
              No articles found. Pull to refresh.
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: Colors[colorScheme].icon + '20' }]} />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  articleItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  articleTitle: {
    flex: 1,
    fontSize: 16,
  },
  readTitle: {
    opacity: 0.6,
  },
  articleDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginLeft: 16,
  },
  pubDate: {
    fontSize: 12,
    opacity: 0.4,
    marginLeft: 16,
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
    gap: 12,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 4,
  },
});

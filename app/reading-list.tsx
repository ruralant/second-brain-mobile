import { useFocusEffect } from 'expo-router';
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
import { getSavedArticles, markAsRead, toggleSaveArticle } from '@/db/articles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Article } from '@/types';

type SavedArticle = Article & { feedTitle: string };

export default function ReadingListScreen() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const loadArticles = useCallback(() => {
    setArticles(getSavedArticles());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadArticles();
    }, [loadArticles])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadArticles();
    setRefreshing(false);
  }, [loadArticles]);

  const handleOpenArticle = useCallback(
    async (article: SavedArticle) => {
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

  const handleUnsave = useCallback(
    (article: SavedArticle) => {
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
    ({ item }: { item: SavedArticle }) => (
      <Pressable
        style={({ pressed }) => [
          styles.articleItem,
          { backgroundColor: pressed ? Colors[colorScheme].tint + '10' : 'transparent' },
        ]}
        onPress={() => handleOpenArticle(item)}
      >
        <View style={styles.articleRow}>
          <View style={styles.articleContent}>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={2}
              style={styles.articleTitle}
            >
              {item.title}
            </ThemedText>
            <ThemedText numberOfLines={1} style={styles.feedTitle}>
              {item.feedTitle}
            </ThemedText>
            {item.pubDate ? (
              <ThemedText style={styles.pubDate}>{formatDate(item.pubDate)}</ThemedText>
            ) : null}
          </View>
          <Pressable
            onPress={() => handleUnsave(item)}
            hitSlop={8}
            style={styles.bookmarkButton}
          >
            <IconSymbol
              name="bookmark.fill"
              size={22}
              color={Colors[colorScheme].tint}
            />
          </Pressable>
        </View>
      </Pressable>
    ),
    [colorScheme, handleOpenArticle, handleUnsave]
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
            <IconSymbol name="bookmark" size={48} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.emptyText}>
              No saved articles yet. Tap the bookmark icon on any article to save it here.
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
  articleTitle: {
    fontSize: 16,
  },
  feedTitle: {
    fontSize: 13,
    opacity: 0.5,
  },
  pubDate: {
    fontSize: 12,
    opacity: 0.4,
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 4,
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
});

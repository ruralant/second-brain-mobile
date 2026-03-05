import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { upsertArticles } from '@/db/articles';
import { addFeed, updateLastFetched } from '@/db/feeds';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchAndParseFeed } from '@/services/rss';

export default function AddFeedScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a feed URL.');
      return;
    }

    setLoading(true);
    try {
      const parsed = await fetchAndParseFeed(trimmed);
      const feed = addFeed(trimmed, parsed.title, parsed.description);
      upsertArticles(feed.id, parsed.articles);
      updateLastFetched(feed.id);
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let title = 'Error Adding Feed';
      if (message.includes('Network error')) {
        title = 'Connection Failed';
      } else if (message.includes('parse')) {
        title = 'Invalid Feed Format';
      } else if (message.includes('Server returned')) {
        title = 'Server Error';
      } else if (message.includes('UNIQUE constraint')) {
        title = 'Duplicate Feed';
        Alert.alert(title, 'This feed URL has already been added.');
        return;
      }
      Alert.alert(title, message || 'Could not add the feed. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Feed URL
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: Colors[colorScheme].icon + '40',
              backgroundColor: Colors[colorScheme].icon + '10',
            },
          ]}
          placeholder="https://example.com/feed.xml"
          placeholderTextColor={Colors[colorScheme].icon}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!loading}
        />
        <ThemedText style={styles.hint}>
          Enter an RSS or Atom feed URL. The app will automatically detect the feed title and articles.
        </ThemedText>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].tint },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Add Feed</ThemedText>
          )}
        </Pressable>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

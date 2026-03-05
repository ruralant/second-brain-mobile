import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { addCategory, getAllCategories } from '@/db/categories';
import { addTask } from '@/db/tasks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Category, Priority } from '@/types';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 1, label: 'Low', color: '#9CA3AF' },
  { value: 2, label: 'Medium', color: '#F59E0B' },
  { value: 3, label: 'High', color: '#EF4444' },
];

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(2);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>(() => getAllCategories());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');

  const handleCreateCategory = useCallback(() => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      const cat = addCategory(trimmed, CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]);
      setCategories(getAllCategories());
      setSelectedCategory(cat.id);
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch {
      Alert.alert('Error', 'A category with that name already exists.');
    }
  }, [newCategoryName, categories.length]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    addTask(trimmed, selectedCategory, priority);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* Title */}
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Task Title
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
            placeholder="What needs to be done?"
            placeholderTextColor={Colors[colorScheme].icon}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />

          {/* Priority */}
          <ThemedText type="defaultSemiBold" style={[styles.label, styles.sectionLabel]}>
            Priority
          </ThemedText>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.priorityOption,
                  {
                    borderColor: priority === p.value ? p.color : Colors[colorScheme].icon + '30',
                    backgroundColor: priority === p.value ? p.color + '15' : 'transparent',
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <ThemedText style={styles.priorityText}>{p.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Category */}
          <ThemedText type="defaultSemiBold" style={[styles.label, styles.sectionLabel]}>
            Category
          </ThemedText>
          <View style={styles.categoryList}>
            <Pressable
              style={[
                styles.categoryChip,
                {
                  borderColor: selectedCategory === null ? Colors[colorScheme].tint : Colors[colorScheme].icon + '30',
                  backgroundColor: selectedCategory === null ? Colors[colorScheme].tint + '15' : 'transparent',
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <ThemedText style={styles.categoryChipText}>None</ThemedText>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: selectedCategory === cat.id ? cat.color : Colors[colorScheme].icon + '30',
                    backgroundColor: selectedCategory === cat.id ? cat.color + '15' : 'transparent',
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <ThemedText style={styles.categoryChipText}>{cat.name}</ThemedText>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.categoryChip,
                {
                  borderColor: Colors[colorScheme].icon + '30',
                  borderStyle: 'dashed',
                },
              ]}
              onPress={() => setShowNewCategory(true)}
            >
              <IconSymbol name="plus" size={14} color={Colors[colorScheme].icon} />
              <ThemedText style={[styles.categoryChipText, { opacity: 0.6 }]}>New</ThemedText>
            </Pressable>
          </View>

          {/* Inline new category */}
          {showNewCategory && (
            <View style={styles.newCategoryRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.newCategoryInput,
                  {
                    color: textColor,
                    borderColor: Colors[colorScheme].icon + '40',
                    backgroundColor: Colors[colorScheme].icon + '10',
                  },
                ]}
                placeholder="Category name"
                placeholderTextColor={Colors[colorScheme].icon}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                returnKeyType="done"
                onSubmitEditing={handleCreateCategory}
              />
              <Pressable
                style={[styles.newCategoryBtn, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={handleCreateCategory}
              >
                <ThemedText style={styles.newCategoryBtnText}>Add</ThemedText>
              </Pressable>
            </View>
          )}

          {/* Submit */}
          <Pressable
            style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.buttonText}>Add Task</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

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
  sectionLabel: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 14,
  },
  newCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  newCategoryInput: {
    flex: 1,
  },
  newCategoryBtn: {
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCategoryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

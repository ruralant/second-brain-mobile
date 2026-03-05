import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { addCategory, deleteCategory, getAllCategories } from '@/db/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Category } from '@/types';

const PALETTE = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

export default function ManageCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>(() => getAllCategories());
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');

  const reload = useCallback(() => {
    setCategories(getAllCategories());
  }, []);

  const handleAdd = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      addCategory(trimmed, selectedColor);
      setName('');
      setSelectedColor(PALETTE[(categories.length + 1) % PALETTE.length]);
      reload();
    } catch {
      Alert.alert('Error', 'A category with that name already exists.');
    }
  }, [name, selectedColor, categories.length, reload]);

  const handleDelete = useCallback(
    (cat: Category) => {
      Alert.alert(
        'Delete Category',
        `Remove "${cat.name}"? Tasks using this category will have no category assigned.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteCategory(cat.id);
              reload();
            },
          },
        ]
      );
    },
    [reload]
  );

  return (
    <ThemedView style={styles.container}>
      {/* Add new category */}
      <View style={styles.addSection}>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: Colors[colorScheme].icon + '40',
              backgroundColor: Colors[colorScheme].icon + '10',
            },
          ]}
          placeholder="New category name"
          placeholderTextColor={Colors[colorScheme].icon}
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <View style={styles.colorPalette}>
          {PALETTE.map((color) => (
            <Pressable
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={handleAdd}
        >
          <IconSymbol name="plus" size={18} color="#fff" />
          <ThemedText style={styles.addButtonText}>Add Category</ThemedText>
        </Pressable>
      </View>

      {/* Category list */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={categories.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              No categories yet. Create one above.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
            <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
            <Pressable onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <IconSymbol name="trash" size={18} color={Colors[colorScheme].icon} />
            </Pressable>
          </View>
        )}
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
  addSection: {
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  deleteBtn: {
    padding: 6,
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
    paddingTop: 48,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
});

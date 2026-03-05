import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getAllCategories } from '@/db/categories';
import { deleteTask, getAllTasks, toggleTask } from '@/db/tasks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Category, TaskWithCategory } from '@/types';

const PRIORITY_COLORS = { 3: '#EF4444', 2: '#F59E0B', 1: '#9CA3AF' } as const;
const PRIORITY_LABELS = { 3: 'High', 2: 'Medium', 1: 'Low' } as const;

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';

  const loadData = useCallback(() => {
    setTasks(getAllTasks());
    setCategories(getAllCategories());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggle = useCallback(
    (id: number) => {
      toggleTask(id);
      loadData();
    },
    [loadData]
  );

  const handleDelete = useCallback(
    (task: TaskWithCategory) => {
      Alert.alert('Delete Task', `Remove "${task.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(task.id);
            loadData();
          },
        },
      ]);
    },
    [loadData]
  );

  const filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.isCompleted) return false;
    if (filterCategory !== null && task.categoryId !== filterCategory) return false;
    return true;
  });

  const renderTask = useCallback(
    ({ item }: { item: TaskWithCategory }) => (
      <Pressable
        style={styles.taskItem}
        onLongPress={() => handleDelete(item)}
      >
        <Pressable onPress={() => handleToggle(item.id)} style={styles.checkbox}>
          <IconSymbol
            name={item.isCompleted ? 'checkmark.circle.fill' : 'circle'}
            size={24}
            color={item.isCompleted ? Colors[colorScheme].tint : Colors[colorScheme].icon}
          />
        </Pressable>
        <View style={styles.taskInfo}>
          <ThemedText
            numberOfLines={2}
            style={[
              styles.taskTitle,
              item.isCompleted && styles.taskCompleted,
            ]}
          >
            {item.title}
          </ThemedText>
          <View style={styles.taskMeta}>
            {item.categoryName ? (
              <View style={[styles.categoryBadge, { backgroundColor: (item.categoryColor ?? '#6B7280') + '20' }]}>
                <View style={[styles.categoryDot, { backgroundColor: item.categoryColor ?? '#6B7280' }]} />
                <ThemedText style={styles.categoryText}>{item.categoryName}</ThemedText>
              </View>
            ) : null}
            <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority as 1 | 2 | 3] + '20' }]}>
              <ThemedText style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority as 1 | 2 | 3] }]}>
                {PRIORITY_LABELS[item.priority as 1 | 2 | 3]}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    ),
    [colorScheme, handleDelete, handleToggle]
  );

  return (
    <ThemedView style={styles.container}>
      {/* Filter bar */}
      {(categories.length > 0 || tasks.some((t) => t.isCompleted)) && (
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: 'All' } as { id: number | null; name: string }, ...categories]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filterCategory === item.id
                        ? Colors[colorScheme].tint
                        : Colors[colorScheme].icon + '15',
                  },
                ]}
                onPress={() => setFilterCategory(item.id)}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    filterCategory === item.id && { color: '#fff' },
                  ]}
                >
                  {item.name}
                </ThemedText>
              </Pressable>
            )}
          />
          <Pressable
            style={styles.toggleCompleted}
            onPress={() => setShowCompleted((v) => !v)}
          >
            <IconSymbol
              name={showCompleted ? 'checkmark.circle.fill' : 'circle'}
              size={18}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.toggleText}>Done</ThemedText>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTask}
        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="checklist" size={64} color={Colors[colorScheme].icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No tasks yet
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Add your first task to get organized
            </ThemedText>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/add-task')}
            >
              <ThemedText style={styles.emptyButtonText}>Add Task</ThemedText>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: Colors[colorScheme].icon + '20' }]} />
        )}
      />

      {tasks.length > 0 && (
        <View style={styles.fabRow}>
          <Pressable
            style={[styles.fabSmall, { backgroundColor: Colors[colorScheme].icon + '30' }]}
            onPress={() => router.push('/manage-categories')}
          >
            <IconSymbol name="tag" size={22} color={Colors[colorScheme].text} />
          </Pressable>
          <Pressable
            style={[styles.fab, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={() => router.push('/add-task')}
          >
            <IconSymbol name="plus" size={28} color="#fff" />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  filterList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toggleCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  toggleText: {
    fontSize: 13,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
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
  fabRow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  fab: {
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

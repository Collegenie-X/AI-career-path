import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, FONT_SIZES } from '../config/theme';
import { TAB_LABELS } from '../config/labels';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  label: string;
  iconActive: IoniconsName;
  iconInactive: IoniconsName;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  HomeTab: {
    label: TAB_LABELS.home,
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  JobsTab: {
    label: TAB_LABELS.jobs,
    iconActive: 'briefcase',
    iconInactive: 'briefcase-outline',
  },
  CareerTab: {
    label: TAB_LABELS.career,
    iconActive: 'map',
    iconInactive: 'map-outline',
  },
  LaunchpadTab: {
    label: TAB_LABELS.launchpad,
    iconActive: 'rocket',
    iconInactive: 'rocket-outline',
  },
};

const DEFAULT_TAB: TabConfig = {
  label: '',
  iconActive: 'ellipse',
  iconInactive: 'ellipse-outline',
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const config = TAB_CONFIG[route.name] ?? DEFAULT_TAB;
          const iconName = isActive ? config.iconActive : config.iconInactive;
          const iconColor = isActive ? COLORS.primary : COLORS.textMuted;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              {isActive && <View style={styles.activeIndicator} />}
              <Ionicons name={iconName} size={22} color={iconColor} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? COLORS.primary : COLORS.textMuted },
                ]}
              >
                {config.label || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(12,12,28,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginTop: 2,
  },
});

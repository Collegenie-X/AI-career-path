import React from 'react';
import { View, StyleSheet } from 'react-native';

interface QuizProgressSegmentsProps {
  total: number;
  current: number;
  answered: number;
  color: string;
  segmentColors?: string[];
}

export function QuizProgressSegments({
  total,
  current,
  answered,
  color,
  segmentColors,
}: QuizProgressSegmentsProps) {
  const segmentCount = Math.min(total, 30);

  return (
    <View style={styles.container}>
      {Array.from({ length: segmentCount }).map((_, index) => {
        const isDone = index < answered;
        const isCurrent = index === current;
        const segmentColor = segmentColors?.[index] ?? color;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              { flex: 1 },
              isDone
                ? { backgroundColor: segmentColor, opacity: 1 }
                : isCurrent
                ? { backgroundColor: segmentColor, opacity: 0.45 }
                : { backgroundColor: 'rgba(255,255,255,0.1)' },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 3,
    marginBottom: 6,
  },
  segment: {
    height: 4,
    borderRadius: 2,
  },
});

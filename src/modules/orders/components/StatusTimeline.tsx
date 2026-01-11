import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StatusEntry} from '../../../types/api.types';
import {format} from 'date-fns';

interface StatusTimelineProps {
  timeline: StatusEntry[];
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({timeline}) => {
  const sortedTimeline = [...timeline].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, hh:mm a');
    } catch {
      return timestamp;
    }
  };

  return (
    <View style={styles.container}>
      {sortedTimeline.map((entry, index) => {
        const isLast = index === sortedTimeline.length - 1;

        return (
          <View key={index} style={styles.timelineItem}>
            {/* Dot and Line */}
            <View style={styles.timelineIndicator}>
              <View style={[styles.dot, isLast && styles.dotActive]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={[styles.content, isLast && styles.contentLast]}>
              <View style={styles.statusRow}>
                <Text style={[styles.status, isLast && styles.statusActive]}>
                  {entry.status}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(entry.timestamp)}
                </Text>
              </View>

              {entry.notes && (
                <Text style={styles.notes}>{entry.notes}</Text>
              )}

              {entry.updatedBy && (
                <Text style={styles.updatedBy}>By: {entry.updatedBy}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C7C7CC',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 4,
    minHeight: 40,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  contentLast: {
    paddingBottom: 0,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C3C43',
  },
  statusActive: {
    color: '#007AFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notes: {
    fontSize: 13,
    color: '#3C3C43',
    marginTop: 4,
    lineHeight: 18,
  },
  updatedBy: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default StatusTimeline;

import React from 'react';
import { View, Text } from 'react-native';
import { BatchStatus } from '../../../types/delivery';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  COLLECTING: { bg: '#dbeafe', text: '#1d4ed8' },
  READY_FOR_DISPATCH: { bg: '#fed7aa', text: '#c2410c' },
  DISPATCHED: { bg: '#ccfbf1', text: '#0d9488' },
  IN_PROGRESS: { bg: '#e9d5ff', text: '#7c3aed' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a' },
  PARTIAL_COMPLETE: { bg: '#fef9c3', text: '#a16207' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626' },
};

const STATUS_LABELS: Record<string, string> = {
  COLLECTING: 'Collecting',
  READY_FOR_DISPATCH: 'Ready',
  DISPATCHED: 'Dispatched',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PARTIAL_COMPLETE: 'Partial',
  CANCELLED: 'Cancelled',
};

interface Props {
  status: string;
}

const BatchStatusBadge: React.FC<Props> = ({ status }) => {
  const colors = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#6b7280' };
  const label = STATUS_LABELS[status] || status;

  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};

export default BatchStatusBadge;

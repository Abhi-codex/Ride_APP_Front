import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface RecentActivity {
  id: string;
  type: 'ride_completed' | 'payment_received' | 'rating_received';
  message: string;
  time: string;
  amount?: number;
}

interface RecentActivityProps {
  activities: RecentActivity[];
}

export const RecentActivityCard: React.FC<RecentActivityProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'ride_completed':
        return '🚑';
      case 'payment_received':
        return '💰';
      case 'rating_received':
        return '⭐';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'ride_completed':
        return colors.secondary[500];
      case 'payment_received':
        return colors.warning[500];
      case 'rating_received':
        return colors.primary[500];
      default:
        return colors.gray[500];
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.gray[900],
          marginBottom: 16,
        }}
      >
        Recent Activity
      </Text>

      <ScrollView 
        style={{ maxHeight: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {activities.map((activity, index) => (
          <View
            key={activity.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: index < activities.length - 1 ? 1 : 0,
              borderBottomColor: colors.gray[100],
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${getActivityColor(activity.type)}15`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {getActivityIcon(activity.type)}
              </Text>
            </View>
            
            <View style={[styles.flex1]}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.gray[900],
                  marginBottom: 2,
                }}
              >
                {activity.message}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.gray[500],
                }}
              >
                {activity.time}
              </Text>
            </View>
            
            {activity.amount && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.secondary[600],
                }}
              >
                +₹{activity.amount}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

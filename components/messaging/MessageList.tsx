import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { styles } from '../../constants/TailwindStyles';

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  type?: string;
  timestamp: string;
  read?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <View style={[
          styles.p3, styles.roundedXl, styles.mb2,
          item.sender === currentUserId ? [styles.bgPrimary100, styles.selfEnd] : [styles.bgGray100, styles.selfStart]
        ]}>
          <Text style={[styles.textBase, styles.textGray900]}>{item.content}</Text>
          <Text style={[styles.textXs, styles.textGray500, styles.mt1, styles.selfEnd]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingVertical: 8 }}
      inverted
    />
  );
};

export default MessageList;

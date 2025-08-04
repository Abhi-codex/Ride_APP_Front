import React from 'react';
import { StyleSheet, View } from 'react-native';
import MessageInput from './MessageInput';
import MessageList, { Message } from './MessageList';

interface ChatBoxProps {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, currentUserId, onSend, disabled }) => {
  return (
    <View style={[styles.flex1, styles.bgGray50]}>
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageInput onSend={onSend} disabled={disabled} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  bgGray50: {
    backgroundColor: '#f7f7f7',
  },
});

export default ChatBox;

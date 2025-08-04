import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChatBox from '../../components/messaging/ChatBox';
import DoctorList from '../../components/messaging/DoctorList';
import TimeSlotPicker from '../../components/messaging/TimeSlotPicker';
import { styles } from '../../constants/TailwindStyles';
import { getServerUrl } from '../../utils/network';

export default function ConsultationScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'select-doctor' | 'select-slot' | 'chat'>('select-doctor');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${getServerUrl()}/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setDoctors(data.data || []);
        } else {
          setDoctors([]);
        }
      } catch {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when doctor selected
  useEffect(() => {
    if (!selectedDoctor) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${getServerUrl()}/doctors/${selectedDoctor._id}/slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setSlots(data.data || []);
        } else {
          setSlots([]);
        }
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor]);

  // Fetch messages when slot selected
  useEffect(() => {
    if (!selectedSlot || !selectedDoctor) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        // Use appointmentId if available, else fallback to doctor-patient chat
        const url = `${getServerUrl()}/messages?doctorId=${selectedDoctor._id}&slotId=${selectedSlot._id}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setMessages(data.data || []);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedSlot, selectedDoctor]);

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep('select-slot');
  };
  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setStep('chat');
  };
  const handleSend = async (msg: string) => {
    if (!selectedDoctor || !selectedSlot) return;
    setSending(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${getServerUrl()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          slotId: selectedSlot._id,
          content: msg,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setMessages((prev: any[]) => [...prev, data.data]);
      }
    } catch {}
    setSending(false);
  };

  return (
    <View style={[styles.flex1, styles.bgWhite, styles.pt8]}>
      <View style={[styles.px5, styles.pt2, styles.pb3, styles.bgWhite, styles.shadowSm]}>
        <Text style={[styles.text3xl, styles.fontBold, styles.textBlack]}>
          Doctor Consultation
        </Text>
        <Text style={[styles.textSm, styles.textGray600]}>
          Book an appointment and chat with a doctor instantly for free health advice.
        </Text>
      </View>
      <ScrollView contentContainerStyle={[styles.px5, styles.pt4, styles.flexGrow]}>
        {step === 'select-doctor' && (
          <>
            <Text style={[styles.textLg, styles.fontSemibold, styles.mb3]}>Choose a Doctor</Text>
            {loadingDoctors ? (
              <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 24 }} />
            ) : (
              <DoctorList doctors={doctors} onSelect={handleDoctorSelect} />
            )}
          </>
        )}
        {step === 'select-slot' && (
          <>
            <TouchableOpacity onPress={() => setStep('select-doctor')} style={[styles.mb4]}>
              <Text style={[styles.textPrimary600, styles.textBase]}>&larr; Back to doctors</Text>
            </TouchableOpacity>
            <Text style={[styles.textLg, styles.fontSemibold, styles.mb3]}>Select a Time Slot</Text>
            {loadingSlots ? (
              <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 24 }} />
            ) : (
              <TimeSlotPicker slots={slots} selectedSlotId={selectedSlot?._id} onSelect={handleSlotSelect} />
            )}
          </>
        )}
        {step === 'chat' && (
          <>
            <TouchableOpacity onPress={() => setStep('select-slot')} style={[styles.mb4]}>
              <Text style={[styles.textPrimary600, styles.textBase]}>&larr; Back to slots</Text>
            </TouchableOpacity>
            <Text style={[styles.textLg, styles.fontSemibold, styles.mb3]}>Chat with {selectedDoctor?.name}</Text>
            {loadingMessages ? (
              <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 24 }} />
            ) : (
              <ChatBox messages={messages} currentUserId="me" onSend={handleSend} disabled={sending} />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

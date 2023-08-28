//import liraries
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button, TextInput} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PushNotification from 'react-native-push-notification';
import database from '@react-native-firebase/database';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
// create a component
const SetAlerm = () => {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();
  const [product, setProduct] = useState();
  const [text, setText] = useState();
  useEffect(() => {
    // setShowPicker(true);
    allItem();
  }, []);
  const allItem = async () => {
    const getProduct = await database()
      .ref('user')
      .on('value', value => {
        setProduct(value._snapshot.value);
      });
  };
  const handleTimeChange = async (event, selectedTime) => {
    if (selectedTime) {
      setShowPicker(false);
      setAlarmTime(selectedTime);
      PushNotification.localNotificationSchedule({
        message: 'Time to wake up!',
        date: selectedTime,
        actions: ['ReplyInput'],
        reply_placeholder_text: 'Write your response...', // (required)
        reply_button_text: 'Reply',
      });
      const index = product?.length ? product?.length : 0;
      const data = await database()
        .ref(`user/${index ? index : 0}`)
        .set({
          id: index ? index : 0,
          time: moment(selectedTime.toString()).format('ddd MMM D YYYY HH:mm'),
          isActive: true,
          label: text,
        });

      navigation?.goBack();
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={text => setText(text)}
        placeholder="Enter label"
      />
      <Button title="Pick Time" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default SetAlerm;

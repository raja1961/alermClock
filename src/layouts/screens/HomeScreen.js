import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native';

import database from '@react-native-firebase/database';
import moment from 'moment/moment';
import {useNavigation} from '@react-navigation/native';
import Sound from 'react-native-sound';
import PushNotification from 'react-native-push-notification';
const HomeScreen = () => {
  const navigation = useNavigation();
  const [product, setProduct] = useState();
  const [timed, setTimed] = useState();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const interval = setInterval(() => {
      allItem();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const allItem = async () => {
    const getProduct = await database()
      .ref('user')
      .on('value', value => {
        const currentTime = moment(new Date()).format('ddd MMM D YYYY HH:mm');
        console.log('value._snapshot.value', currentTime);
        const data =
          value?._snapshot?.value?.length > 0 &&
          value?._snapshot?.value?.filter(item => {
            if (item.time < currentTime) {
              item.isActive = false;
            }
            if (item.time > currentTime || item) {
              return item;
            }
            if (item?.time == currentTime && item.isActive == true) return item;
          });
        setProduct(data);
        const endTime = moment(
          data[0]?.time?.toString(),
          'ddd MMM DD YYYY HH:mm',
        );

        const differenceInMinutes =
          data[0]?.time && endTime.diff(currentTime.toString(), 'minutes');
        setTimed(differenceInMinutes && differenceInMinutes);
        if (data?.length) {
          data.map(time => {
            if (time?.time == currentTime && time.isActive == true) {
              const sound = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, error => {
                if (error) {
                  console.log('Failed to load the sound', error);
                  return;
                }
                sound.play(success => {
                  if (success) {
                    if (time.isActive == true) {
                      Alert.alert('', 'Time to wake up ?', [
                        {
                          text: 'Snooze',
                          onPress: async () => {
                            const removeData = await database()
                              .ref(`user/${time?.id}`)
                              .update({
                                // id: data[0]?.id,
                                time: moment(time?.time)
                                  .clone()
                                  .add(2, 'minutes')
                                  .format('ddd MMM D YYYY HH:mm'),
                              });
                            PushNotification.localNotificationSchedule({
                              message: 'Time to wake up!',
                              date: moment(time?.time)
                                .clone()
                                .add(2, 'minutes')
                                .format('ddd MMM D YYYY HH:mm'),
                              actions: ['ReplyInput'],
                              reply_placeholder_text: 'Write your response...', // (required)
                              reply_button_text: 'Reply',
                            });
                          },
                          style: 'cancel',
                        },
                        {
                          text: 'OK',
                          onPress: async () => {
                            try {
                              const removeData = await database()
                                .ref(`user/${time?.id}`)
                                .update({
                                  isActive: false,
                                });
                              // allItem();
                            } catch (error) {
                              console.log('error========>', error);
                            }
                          },
                        },
                      ]);
                    }

                    console.log('Sound played successfully');
                  } else {
                    console.warn('Sound playback failed');
                  }
                });
              });
            }
          });
        }
      });
  };
  const handleRemove = id => {
    Alert.alert('', 'Are you want to delete ?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          try {
            const removeData = await database().ref(`user/${id}`).remove();
            allItem();
          } catch (error) {
            console.log('error========>', error);
          }
        },
      },
    ]);
  };
  return (
    <>
      <View style={{flex: 1, height: '100%'}}>
        {product?.length > 0 ? (
          <ScrollView
            style={{
              // height: '93%',
              // height: '93%',
              backgroundColor: '#fff',
              paddingHorizontal: 12,
            }}>
            {product?.map(item => {
              console.log(moment(item?.time).format('HH:mm'));
              return (
                <View
                  key={item?.id}
                  style={{
                    backgroundColor: item.isActive == true ? '#fff' : '#dcdede',
                    marginVertical: 5,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    borderRadius: 10,
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    elevation: 5,
                  }}>
                  <View>
                    <Text style={{fontSize: 28}}>
                      {moment(item?.time, 'ddd MMM DD YYYY HH:mm').format(
                        'HH:mm',
                      )}
                    </Text>
                    {item?.label && <Text>{item?.label}</Text>}
                  </View>

                  <TouchableOpacity
                    style={{alignSelf: 'center'}}
                    onPress={() => handleRemove(item?.id)}>
                    <Image
                      source={require('../../assets/imgs/bin.png')}
                      style={{height: 30, width: 30}}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View
            style={{flex: 1, alignSelf: 'center', justifyContent: 'center'}}>
            <View
              style={{
                backgroundColor: '#E5E5E5',
                marginVertical: 5,
                paddingVertical: 10,
                borderRadius: 10,
                paddingHorizontal: 10,
              }}>
              <Text>No alerm found</Text>
            </View>
          </View>
        )}
      </View>
      <View style={{justifyContent: 'flex-end'}}>
        <Button
          title="Set Alarm"
          onPress={() => navigation.navigate('SetAlerm')}
        />
      </View>
    </>
  );
};

export default HomeScreen;

import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";

const PushControllerService = ({ navigation }) => {

  useEffect(() => {

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      if (remoteMessage.data.page_redirect == "lead") {
        navigation.navigate('MyLeads')
      }
    });

    PushNotification.configure({
      onNotification: function (remoteMessage) {
        console.log("NOTIFICATION:", remoteMessage);
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
        if (remoteMessage.data.page_redirect == "lead") {
          navigation.navigate('MyLeads')
        }
      },
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      var dataMsg = JSON.stringify(remoteMessage.notification);
      if (Platform.OS === 'ios') {
        PushNotificationIOS.addNotificationRequest({
          id: "vriddhi1234",
          title: JSON.parse(dataMsg).title,
          body: JSON.parse(dataMsg).body,
          sound: "default",
        });
      }
      PushNotification.localNotification({
        channelId: "vriddhi1234",
        vibrate: true,
        title: JSON.parse(dataMsg).title,
        body: JSON.parse(dataMsg).body,
        playSound: true,
        soundName: "default",
        smallIcon: "ic_notification",
      });
    });

    return unsubscribe;

  }, []);

  return ({});
};

export default PushControllerService;

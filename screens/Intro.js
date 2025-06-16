import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeBaseProvider } from 'native-base';
import React, { useEffect } from 'react';
import { ImageBackground, StatusBar, StyleSheet } from 'react-native';

const IntroScreen = ({ navigation }) => {

    useEffect(() => {
        setTimeout(function () {
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('Login');
                }
            });
        }, 5800);
    }, []);

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ImageBackground source={require('../assets/images/flash.gif')} imageStyle={{ resizeMode: 'cover', position: 'absolute', bottom: 0, top: 0, opacity: 1 }} style={styles.bgimage}></ImageBackground>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
});

export default IntroScreen;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, ScrollView, Stack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const RateUsScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");


    useEffect(() => {
        setLoading(true);
        getLoadData();
    }, [])

    const getLoadData = () => {
        setLoading(false);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);
                
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box flex={1} bg="white">
                <LinearGradient
                    colors={["#ffffff", lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Rate Us")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: 0.6 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <VStack flex={1} padding="6" alignItems="center">
                            <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                <Icon name="hourglass-outline" size={80} color="#999999" />
                                <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                            </Stack>
                        </VStack>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default RateUsScreen;

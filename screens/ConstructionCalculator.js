import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, ScrollView, Stack, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ImageBackground, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const ConstructionCalculatorScreen = ({ navigation }) => {

    const {t} = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const calculatorList = [
        {
            "name": t("Cement"),
            "link": "https://nuvonirmaan.com/cement-calculator/"
        },
        {
            "name": t("Concrete"),
            "link": "https://nuvonirmaan.com/concrete-calculator/"
        },
        {
            "name": t("Modern Building Materials"),
            "link": "https://nuvonirmaan.com/modern-building-materials-calculator/"
        },
        {
            "name": t("Multi-Product"),
            "link": "https://nuvonirmaan.com/multi-product-calculator/"
        }
    ];


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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Construction Calculator")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: 0.6 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 90, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>

                        <Box padding="5">
                                <VStack>
                                    {calculatorList.map((item, index) =>
                                        <Box key={index} style={styles.productbox}>
                                            <HStack justifyContent="space-between" alignItems="center">
                                                <HStack style={{ width: '55%' }} alignItems="center" space={2}>
                                                    <Icon name="calculator-outline" size={30} color="#111111" />
                                                    <Text fontSize='sm' fontWeight="bold" color="#111111">{item.name}</Text>
                                                </HStack>
                                                <LinearGradient
                                                    colors={[lightColor, darkColor]}
                                                    start={{ x: 0.5, y: 0 }}
                                                    style={{ width: '30%', height: 38, borderRadius: 10, overflow: 'hidden' }}
                                                >
                                                    <Button size="xs" variant="link" onPress={() => Linking.openURL(item.link)}>
                                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Calculate")}</Text>
                                                    </Button>
                                                </LinearGradient>
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>
                        </Box>
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
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default ConstructionCalculatorScreen;

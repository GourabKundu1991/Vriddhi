import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, StatusBar, View, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const LeadDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [details, setDetails] = useState([]);

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
        setDetails(route.params.details);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Lead Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <Box flex={1}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 100, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="6">
                            <VStack bg="#eeeeee" space={2} padding="5" mb={6} borderRadius={12}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <VStack space={2}>
                                        <Text fontSize='lg' fontWeight="bold">{details.project_contact_person}</Text>
                                        <Text fontSize='md'>{details.project_contact_phone_number}</Text>
                                    </VStack>
                                    <TouchableOpacity style={{ backgroundColor: '#111111', width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 30, overflow: 'hidden' }} onPress={() => { Linking.openURL(`tel:${details.project_contact_phone_number}`) }}>
                                        <Icon name="call" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </HStack>
                            </VStack>
                            <Box style={styles.productbox}>
                                <Image source={{ uri: details.file_path }} style={{ width: '100%', height: 200 }} resizeMode='contain' />
                            </Box>
                            <VStack space={3}>
                                <VStack bg="#eeeeee" space={2} padding="4" marginY="2" borderRadius={12}>
                                    {details.project_address_line1 != "" && (
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444">{t("Address")}:</Text>
                                            <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.project_address_line1}</Text>
                                        </HStack>
                                    )}
                                    {details.state_name != null && (
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444">{t("State")}:</Text>
                                            <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.state_name}</Text>
                                        </HStack>
                                    )}
                                    {details.city_name != null && (
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444">{t("City")}:</Text>
                                            <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.city_name}</Text>
                                        </HStack>
                                    )}
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("Status")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.status}</Text>
                                    </HStack>
                                    {details.product_brand != "" && (
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Text color="#444444">{t("Current Brand")}:</Text>
                                            <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.product_brand}</Text>
                                        </HStack>
                                    )}
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text color="#444444">{t("Created At")}:</Text>
                                        <Text color="#111111" style={{ width: 200 }} fontSize='md' textAlign="right" fontWeight="medium" textTransform="capitalize">{details.created_at}</Text>
                                    </HStack>
                                </VStack>
                            </VStack>
                        </Box>
                    </ScrollView>
                </Box>
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
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 18, paddingTop: 1, textAlign: 'center' },
    productbox: { borderRadius: 15, borderColor: '#cccccc', backgroundColor: '#ffffff', marginBottom: 30, borderWidth: 5, padding: 15, marginHorizontal: 5 },
    solidBtn: { width: '48%', borderColor: '#111111', borderWidth: 2, backgroundColor: '#111111', borderRadius: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default LeadDetailsScreen;
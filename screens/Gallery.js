import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Stack, Button } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const GalleryScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [albums, setAlbums] = React.useState([]);

    const [filterStatus, setFilterStatus] = React.useState(1);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            setFilterStatus(1);
            getAllData(filterStatus);
        });
        return unsubscribe;
    }, []);

    const getAllData = (type) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);
                
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("contentType", type);
                fetch(`${BASE_URL}/get_gallery`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Album:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setAlbums(responseJson.gallery_list);
                            if (responseJson.gallery_list.length != 0) {
                                setDataFound("found");
                            } else {
                                setDataFound("notfound");
                            }
                        } else {
                            Toast.show({ description: responseJson.message });
                            setDataFound("notfound");
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Album Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onSetFilter = (dataVal) => {
        setLoading(true);
        setFilterStatus(dataVal);
        getAllData(dataVal);
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Gallery")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: albums.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 80, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <Box style={[styles.productbox, { paddingHorizontal: 8 }]}>
                                <HStack alignItems="center" justifyContent="space-evenly">
                                    <LinearGradient
                                        colors={filterStatus == "1" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "1" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("1")}>{t("Images")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={filterStatus == "2" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "2" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("2")}>{t("Videos")}</Button>
                                    </LinearGradient>
                                    <LinearGradient
                                        colors={filterStatus == "3" ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                        start={{ x: 0.5, y: 0 }}
                                        style={[styles.custbtn, { width: '30%' }]}
                                    >
                                        <Button size="xs" variant="link" _text={{ color: filterStatus == "3" ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("3")}>{t("Documents")}</Button>
                                    </LinearGradient>
                                </HStack>
                            </Box>
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <HStack flexWrap="wrap">
                                    {albums.map((item, index) =>
                                        <VStack key={index} style={[styles.productbox, {borderColor: item.is_engineer == false ? "#2BBB86" : "#f04e23"}]}>
                                            <TouchableOpacity onPress={() => navigation.navigate("GalleryDetails", { albumId: item.id, albumType: item.contentType })}>
                                                <Box style={styles.productimage}>
                                                    <Image source={{ uri: item.display_image }} style={{ width: 300, height: 200 }} resizeMode='contain' />
                                                </Box>
                                                <Text fontWeight="bold" fontSize='lg' color={item.is_engineer == false ? "#2BBB86" : "#f04e23"} textAlign="center">{item.name}</Text>
                                            </TouchableOpacity>
                                        </VStack>
                                    )}
                                </HStack>
                            )}
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
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '94%', margin: '3%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', marginBottom: 15, borderWidth: 1, borderRadius: 10, width: '100%', height: 180, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default GalleryScreen;
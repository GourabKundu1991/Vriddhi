import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import ImageView from "react-native-image-viewing";
import Pdf from 'react-native-pdf';
import { useTranslation } from 'react-i18next';
import Video from 'react-native-video';
import WebView from 'react-native-webview';

const GalleryDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [allImages, setAllImages] = React.useState([]);
    const [albumName, setAlbumName] = React.useState("");

    const [imagePop, setImagePop] = React.useState(false);
    const [imageIndex, setImageIndex] = React.useState("");

    const images = [];

    const [isPDF, setIsPDF] = React.useState(false);
    const [isVideo, setIsVideo] = React.useState(false);
    const [sourcePDF, setSourcePDF] = React.useState("");
    const [sourceVideo, setSourceVideo] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);
                
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("album_id", route.params.albumId);
                formdata.append("contentType", route.params.albumType);
                fetch(`${BASE_URL}/get_album_details_by_id`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Gallery:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            for (let i = 0; i < responseJson.album_details.length; i++) {
                                images.push(
                                    { view: responseJson.album_details[i].display_image, uri: responseJson.album_details[i].file_url, title: responseJson.album_details[i].title }
                                );
                            }
                            setAllImages(images);
                            setAlbumName(responseJson.album_name);
                        } else {
                            Toast.show({ description: responseJson.message });
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
                        //console.log("Gallery Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const viewImage = (ind, url) => {
        if (route.params.albumType == 1) {
            setImagePop(true);
            setImageIndex(ind);
        } else if (route.params.albumType == 2) {
            setIsVideo(true);
            setSourceVideo(url);
        } else if (route.params.albumType == 3) {
            setIsPDF(true);
            setSourcePDF(url);
        }
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
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{albumName}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: allImages.length < 3 ? 0.6 : 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <HStack flexWrap="wrap">
                                {allImages.map((item, index) =>
                                    <VStack key={index} style={styles.productbox}>
                                        <TouchableOpacity onPress={() => viewImage(index, item.uri)}>
                                            <Box style={styles.productimage}>
                                                <Image source={{ uri: item.view }} style={{ width: 350, height: 250 }} resizeMode='contain' />
                                            </Box>
                                            <Text fontWeight="bold" fontSize='lg' color="#444444" textAlign="center" mt="2">{item.title}</Text>
                                        </TouchableOpacity>
                                    </VStack>
                                )}
                            </HStack>
                        </Box>
                    </ScrollView>
                </ImageBackground>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            <ImageView
                images={allImages}
                imageIndex={imageIndex}
                visible={imagePop}
                onRequestClose={() => setImagePop(false)}
            />
            {isPDF && (
                <View style={[styles.spincontainer, { backgroundColor: "#000000" }]}>
                    <TouchableOpacity onPress={() => setIsPDF(false)} style={{ position: "absolute", top: 12, right: 15 }}>
                        <Icon name="close-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                    <Pdf
                        trustAllCerts={false}
                        source={{
                            uri: sourcePDF,
                            cache: true,
                        }}
                        style={styles.pdf} />
                </View>
            )}
            {isVideo && (
                <View style={[styles.spincontainer, { backgroundColor: "#000000" }]}>
                    <TouchableOpacity onPress={() => setIsVideo(false)} style={{ position: "absolute", top: 12, right: 15, zIndex: 9 }}>
                        <Icon name="close-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={{height: 450}}>
                    <WebView 
                        style={{ width: 400, maxWidth: '98%' }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        source={{uri: sourceVideo}}
                    />
                    </View>
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    backgroundVideo: {
        marginTop: 50,
        width: '96%',
        height: 250
    },
    bgimage: { flex: 1, justifyContent: 'center' },
    pdf: { width: '96%', height: '80%', marginHorizontal: '2%', marginTop: 10 },
    productbox: { borderRadius: 15, padding: 10, width: '94%', margin: '3%', backgroundColor: '#f6f6f6', borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', borderRadius: 12, overflow: 'hidden', backgroundColor: '#ffffff', borderWidth: 1, width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default GalleryDetailsScreen;
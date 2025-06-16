import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, Pressable, Stack, Text, Toast, VStack, useDisclose } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, ImageBackground, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';

const PanUploadScreen = ({ navigation, route }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");
    const [logoImage, setLogoImage] = React.useState("");

    const [modalVisible, setModalVisible] = React.useState(true);

    const [panCard, setPanCard] = React.useState("");
    const [panImage, setPanImage] = React.useState("");

    const { isOpen, onOpen, onClose } = useDisclose();

    const [termsCheck, setTermsCheck] = React.useState(false);

    useEffect(() => {
        setLoading(true);
        getAllData();
    }, [])

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
                fetch(`${BASE_URL}/get_basic_ekyc_data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Basic EKYC:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            console.log(responseJson.data.user_id_param);
                            if (responseJson.data.user_id_param != "") {
                                setPanCard(responseJson.data.user_id_param.document_no);
                            }
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
                        console.log("Basic EKYC Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const openProfilePicker = (type) => {
        onClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        setPanImage(response.assets[0].base64);
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        setPanImage(response.assets[0].base64);
                    }
                },
            )
        }
    }

    const onSubmit = () => {
        Keyboard.dismiss();
        if (panCard.trim() == "") {
            Toast.show({ description: t("Please enter Pan Card Number") });
        } else if (panCard.trim() != "" && panImage == "") {
            Toast.show({ description: t("Please Attach Pan Image") });
        } else {
            updatePan();
        }
    }

    const updatePan = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("idProofImage", panImage);
                formdata.append("idProofNumber", panCard);
                fetch(`${BASE_URL}/submit_pan_data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Update Pan:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            setTimeout(function () {
                                setLoading(false);
                                navigation.replace('Home');
                            }, 1000);
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
                        console.log("Update Pan Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    onSkip = () => {
        setModalVisible(false)
        updatePan();
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
                        {route.params.root == "true" ?
                            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ width: 60 }}>
                                <Icon name="menu" size={28} color="#111111" />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                                <Icon name="chevron-back" size={26} color="#111111" />
                            </TouchableOpacity>
                        }
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold">{t("Update PAN")}</Text>
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
                        <Box padding="5">
                            <Box style={styles.productbox}>
                                <View style={styles.inputbox}>
                                    <Input size="lg" value={panCard} onChangeText={(text) => setPanCard(text)} variant="unstyled" maxLength={10} InputLeftElement={<Icon name="card-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pan Card No.") + " *"} />
                                </View>
                                <HStack alignItems="center" mt="3" space={0}>
                                    <Icon name="attach-outline" size={22} color="#666666" />
                                    <Text color="#666666" fontSize="md" textTransform="capitalize">{t("Attach Pan Image")} *</Text>
                                </HStack>
                                <View style={styles.inputbox}>
                                    <Image source={panImage != "" ? { uri: 'data:image/jpeg;base64,' + panImage } : require('../assets/images/noimage.jpg')} alt="image" resizeMode='contain' style={{ width: '100%', height: 160 }} />
                                    <Pressable onPress={onOpen} bg={cameraColor} position="absolute" bottom="3" right="3" width="50" height="50" justifyContent="center" alignItems="center" borderRadius="30" overflow="hidden">
                                        <Icon name="camera" size={26} color="#ffffff" />
                                    </Pressable>
                                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                                        <Actionsheet.Content>
                                            <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                                            <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                                            <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                                            <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                                        </Actionsheet.Content>
                                    </Actionsheet>
                                </View>
                            </Box>
                            {/* <Box style={styles.productbox}>
                                <Text fontWeight={'bold'} color={"#777777"}>
                                    {t("The information provided above are true to my knowledge and I hereby solemnly submit all the documents required. All details captured will be solely used for the purpose of CRM and Loyalty program of Nuvoco only.")}
                                </Text>
                                <Stack pr="4" marginTop="4" flexWrap="wrap">
                                    <Checkbox shadow={2} onChange={() => setTermsCheck(!termsCheck)} accessibilityLabel="Checkbox">
                                        {t("I have also read and agreed to the terms of services and privacy policy.")}
                                    </Checkbox>
                                </Stack>
                            </Box> */}
                        </Box>
                    </ScrollView>
                </ImageBackground>
                <LinearGradient
                    colors={[darkColor, lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack paddingY="3" paddingX="6" justifyContent="space-between" alignContent="center">
                        <Button style={[styles.custbtn, { borderColor: '#111111', borderWidth: 2 }]} onPress={() => onSubmit()}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Submit")}</Text>
                        </Button>
                    </HStack>
                </LinearGradient>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
            {modalVisible && route.params.root == "true" && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 280, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="alert-circle-outline" size={100} color="#111111"></Icon>
                            <Text mt={2} fontSize="xl" fontWeight="bold" color="#111111">{t("Warning")}!</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("pan194R")}</Text>
                            <HStack justifyContent="space-evenly" space="3">
                                {/* <Button size="sm" style={{ backgroundColor: "#ffffff", width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => onSkip()} marginY={4}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Skip")}</Text>
                                </Button> */}
                                <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => setModalVisible(false)} marginY={4}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { width: '100%', backgroundColor: '#111111', borderRadius: 12, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default PanUploadScreen;

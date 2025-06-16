import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Avatar, Box, HStack, NativeBaseProvider, Stack, Text, Toast, VStack, useDisclose } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {useTranslation} from 'react-i18next';

const ProfileScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");
    const [cameraColor, setCameraColor] = React.useState("#f04e23");

    const [profileDetails, setProfileDetails] = React.useState("");
    const [profilePic, setProfilePic] = React.useState("");
    const [pointDetails, setPointDetails] = React.useState("");

    const [userType, setUserType] = React.useState("");

    const { isOpen, onOpen, onClose } = useDisclose();

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
                setUserType(JSON.parse(val).member_type);

                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);
                
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                fetch(`${BASE_URL}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Profile:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setProfileDetails(responseJson.profile);
                            setProfilePic(responseJson.profile.BaseUrl + responseJson.profile.profile_pic);
                            setPointDetails(responseJson.points);
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
                        //console.log("Profile Error:", error);
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
                        saveProfileImage(response.assets[0].base64);
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
                        saveProfileImage(response.assets[0].base64);
                    }
                },
            )
        }
    }

    const saveProfileImage = (imageBase) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("c_file", imageBase);
                fetch(`${BASE_URL}/change_profile_image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Profile Pic:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            getAllData();
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
                        //console.log("Profile Pic Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
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
            <LinearGradient
                colors={userType == 'Engineer' ? ["#ffffff", lightColor] : ["#ffffff", "#ffffff"]}
                start={{ x: 0.5, y: 0 }}
            >
                <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                        <Icon name="chevron-back" size={26} color="#111111" />
                    </TouchableOpacity>
                    <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Profile")}</Text>
                    <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                </HStack>
            </LinearGradient>
            <Box flex={1} bg="#f6f6f6">
                <LinearGradient
                    colors={userType == 'Engineer' ? [lightColor, darkColor] : ["#ffffff", lightColor, darkColor]}
                    style={{ height: 290, position: 'absolute', width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                    start={{ x: 0.5, y: 0 }}
                ></LinearGradient>
                <VStack mt="4" justifyContent="center" alignItems="center">
                    <Text color="#111111" fontSize="xl" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.firstName} {profileDetails.lastName}</Text>
                    <Text color="#444444" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">( {t("Member Code")}: {profileDetails.ID} )</Text>
                    <VStack alignItems="center" w="100%" space={2} mt={4}>
                        <Stack borderWidth={1} borderColor="#444444" borderStyle="dashed" borderRadius={15} w="50%" padding="1" overflow="hidden">
                            <TouchableOpacity onPress={() => navigation.navigate('PointStatement')}>
                                <Text color="#444444" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Total Points")}</Text>
                                <Text color="#111111" fontSize="lg" textAlign="center" fontWeight="bold" textTransform="capitalize">{pointDetails != "" ? pointDetails.total_point : 0}</Text>
                            </TouchableOpacity>
                        </Stack>
                        <Stack borderWidth={1} borderColor="#444444" borderStyle="dashed" borderRadius={15} w="50%" padding="1" overflow="hidden">
                            <Text color="#444444" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Available for Redemption")}</Text>
                            <Text color="#111111" fontSize="lg" textAlign="center" fontWeight="bold" textTransform="capitalize">{pointDetails != "" ? pointDetails.available_point : 0}</Text>
                        </Stack>
                    </VStack>
                    <Box position="relative">
                        <Avatar style={styles.avatar} w={110} h={110} source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}></Avatar>
                        <TouchableOpacity style={[styles.avatarCamera, { backgroundColor: cameraColor }]} onPress={onOpen}>
                            <Icon name="camera" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Actionsheet isOpen={isOpen} onClose={onClose}>
                            <Actionsheet.Content>
                                <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                                <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                                <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                                <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                            </Actionsheet.Content>
                        </Actionsheet>
                    </Box>
                </VStack>
                <ScrollView>
                    <VStack paddingX={10} mt={0} mb={6}>
                        <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('ProfileDetails')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium">{t("Profile Details")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('PointStatement')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium">{t("Point Statement")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('From16List')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium">{t("TDS Certificate")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('GiftVouchers')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium">{t("Gift Vouchers")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('ChangePassword')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium">{t("Change Password")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.listview} onPress={() => navigation.navigate('Language')}>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                <Text color="#111111" fontSize="md" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Language Change")}</Text>
                                <Icon name="chevron-forward" size={26} color="#999999" />
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </ScrollView>
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
    avatar: { elevation: 10, marginVertical: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, borderColor: "#ffffff", borderWidth: 4, backgroundColor: '#ffffff' },
    avatarCamera: { position: 'absolute', bottom: 18, right: 0, width: 38, height: 38, borderRadius: 40, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    listview: { elevation: 10, marginVertical: 6, padding: 10, shadowColor: '#999999', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, backgroundColor: '#ffffff', borderRadius: 15, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default ProfileScreen;

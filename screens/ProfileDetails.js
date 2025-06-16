import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, Pressable, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, ImageBackground, TouchableWithoutFeedback, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL, CONTACT_HIER_ID, ORG_ID, PROGRAM_ID } from '../auth_provider/Config';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTranslation } from 'react-i18next';

const ProfileDetailsScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");
    const [logoImage, setLogoImage] = React.useState("");

    const [profileDetails, setProfileDetails] = React.useState("");
    const [aadhaarDetails, setAadhaarDetails] = React.useState("");
    const [aadhaarFront, setAadhaarFront] = React.useState("");
    const [aadhaarBack, setAadhaarBack] = React.useState("");
    const [panDetails, setPanDetails] = React.useState("");
    const [panImage, setPanImage] = React.useState("");

    const [zoomImage, setZoomImage] = React.useState(false);
    const [imagePath, setImagePath] = React.useState("");

    const [emailPop, setEmailPop] = React.useState(false);
    const [anniversaryPop, setAnniversaryPop] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [anniversary, setAnniversary] = React.useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

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
                fetch(`${BASE_URL}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        //console.log("Profile:", responseJson);
                        if (responseJson.status == 'success') {
                            setLoading(false);
                            setProfileDetails(responseJson.profile);
                            setAadhaarDetails(responseJson.ekyc.aadhaar);
                            setAadhaarFront(responseJson.profile.BaseUrl + responseJson.ekyc.aadhaar.front_image);
                            setAadhaarBack(responseJson.profile.BaseUrl + responseJson.ekyc.aadhaar.back_image);
                            setPanDetails(responseJson.ekyc.pan);
                            setPanImage(responseJson.profile.BaseUrl + responseJson.ekyc.pan.front_image);
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

    const openImage = (path) => {
        console.log(path);
        setImagePath(path);
        setTimeout(function () {
            setZoomImage(true);
        }, 500);
    }

    const onEdit = (type) => {
        if (type == "Anniversary") {
            setAnniversaryPop(true);
        } else if (type == "Email") {
            setEmailPop(true);
        }
    }

    const showDatePicker = (val) => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        setAnniversary(date);
    };

    const onAnniversaryCancel = () => {
        setAnniversaryPop(false);
        setAnniversary("");
    }

    const onAnniversarySubmit = () => {
        if (anniversary == "") {
            Toast.show({ description: t("Please select Anniversary Date") });
        } else {
            setAnniversaryPop(false);
            updateProfile();
        }
    }

    const onEmailCancel = () => {
        setEmailPop(false);
        setEmail("");
    }

    const onEmailSubmit = () => {
        if (email == "") {
            Toast.show({ description: t("Please enter Email") });
        } else {
            setEmailPop(false);
            updateProfile();
        }
    }

    const updateProfile = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            setLogoImage(JSON.parse(val).logo_url);
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("anniversaryDate", anniversary != "" ? moment(anniversary).format("YYYY-MM-DD") : "");
                formdata.append("email", email);
                console.log(formdata);
                fetch(`${BASE_URL}/update_my_profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Update Profile:", responseJson);
                        if (responseJson.status == 'success') {
                            Toast.show({ description: responseJson.message });
                            setTimeout(function () {
                                setLoading(false);
                                navigation.goBack();
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
                        console.log("Update Profile Error:", error);
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
            <Box flex={1} bg="#ffffff">
                <LinearGradient
                    colors={["#ffffff", lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
                            <Icon name="chevron-back" size={26} color="#111111" />
                        </TouchableOpacity>
                        <Text color="#111111" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Profile Details")}</Text>
                        <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logo.png')} style={{ width: 60, height: 25, resizeMode: 'contain' }} />
                    </HStack>
                </LinearGradient>
                <ImageBackground source={require('../assets/images/bg.jpg')} imageStyle={{ resizeMode: 'contain', position: 'absolute', bottom: 0, top: '65%', opacity: 0 }} style={styles.bgimage}>
                    <ScrollView>
                        <LinearGradient
                            colors={[lightColor, darkColor]}
                            style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                            start={{ x: 0.5, y: 0 }}
                        ></LinearGradient>
                        <Box padding="5">
                            <VStack>
                                <Box style={styles.productbox}>
                                    {profileDetails.firstName != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("First Name")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.firstName}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.lastName != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Last Name")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.lastName}</Text>
                                        </HStack>
                                    )}
                                    <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                        <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Member Code")}:</Text>
                                        <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold">{profileDetails.ID}</Text>
                                    </HStack>
                                    {profileDetails.mobile != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Mobile")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.mobile}</Text>
                                        </HStack>
                                    )}
                                    <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                        <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Email")}:</Text>
                                        {profileDetails.email == "N/A" || profileDetails.email == "" ?
                                            <LinearGradient
                                                colors={[lightColor, darkColor]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={[styles.custbtn, { width: 50 }]}
                                            >
                                                <Button size="xs" variant="link" _text={{ color: "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onEdit("Email")}><Icon name="create-outline" size={20} color="#111111" /></Button>
                                            </LinearGradient>
                                            :
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold">{profileDetails.email}</Text>
                                        }
                                    </HStack>
                                    {profileDetails.dob != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("DOB")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.dob}</Text>
                                        </HStack>
                                    )}
                                    <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                        <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Anniversary")}:</Text>
                                        {profileDetails.anniversary == "N/A" || profileDetails.anniversary == "" ?
                                            <LinearGradient
                                                colors={[lightColor, darkColor]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={[styles.custbtn, { width: 50 }]}
                                            >
                                                <Button size="xs" variant="link" _text={{ color: "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => onEdit("Anniversary")}><Icon name="create-outline" size={20} color="#111111" /></Button>
                                            </LinearGradient>
                                            :
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.anniversary}</Text>
                                        }
                                    </HStack>
                                    {profileDetails.addrLine1 != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 1")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.addrLine1}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.addrLine2 != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 2")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.addrLine2}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.addrLine3 != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 3")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.addrLine3}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.State != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("State")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.State}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.City != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("City")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.City}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.Pin != "" && (
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Pincode")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{profileDetails.Pin}</Text>
                                        </HStack>
                                    )}
                                </Box>
                                {aadhaarDetails.value != "" && (
                                    <Box style={styles.productbox}>
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Aadhaar No")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{aadhaarDetails.value}</Text>
                                        </HStack>
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Aadhaar Front Image")}:</Text>
                                            <Pressable onPress={() => openImage(aadhaarFront)}><Image source={aadhaarFront ? { uri: aadhaarFront } : require('../assets/images/noimage.jpg')} style={{ width: 60, height: 60 }} resizeMode='cover' /></Pressable>
                                        </HStack>
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Aadhaar Back Image")}:</Text>
                                            <Pressable onPress={() => openImage(aadhaarBack)}><Image source={aadhaarBack ? { uri: aadhaarBack } : require('../assets/images/noimage.jpg')} style={{ width: 60, height: 60 }} resizeMode='cover' /></Pressable>
                                        </HStack>
                                    </Box>
                                )}
                                {panDetails.value != "" ?
                                    <Box style={styles.productbox}>
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2} borderColor="#dddddd" borderBottomWidth={1}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Pan Number")}:</Text>
                                            <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{panDetails.value}</Text>
                                        </HStack>
                                        <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                            <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Pan Image")}:</Text>
                                            <Pressable onPress={() => openImage(panImage)}><Image source={panImage ? { uri: panImage } : require('../assets/images/noimage.jpg')} style={{ width: 60, height: 60 }} resizeMode='cover' /></Pressable>
                                        </HStack>
                                    </Box>
                                    :
                                    <Box style={styles.productbox}>
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={{ padding: 10, borderRadius: 10, overflow: 'hidden' }}
                                        >
                                            <TouchableOpacity onPress={() => navigation.navigate('PanUpload', { root: "false" })}>
                                                <HStack justifyContent="space-between" alignItems="center" w="100%" padding={2}>
                                                    <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Upload Pan Details")}</Text>
                                                    <Icon name="cloud-upload" size={40} color="#444444" />
                                                </HStack>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </Box>
                                }
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
            {zoomImage && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 99, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: imagePath }} style={{ width: '90%', height: 400, marginBottom: 20, resizeMode: 'contain' }} />
                    <TouchableOpacity onPress={() => setZoomImage(false)}>
                        <Icon name="close-circle-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                </VStack>
            )}
            {anniversaryPop && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Box style={styles.productbox}>
                        <Text color={darkColor} fontSize="16" fontWeight="medium" textAlign="center" mb="4" pb="3" borderBottomWidth={1} borderColor={"#dddddd"}>{t("Anniversary Date")}</Text>
                        <Pressable style={styles.inputbox} onPress={() => showDatePicker()}>
                            <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                                <Icon name="calendar-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                <Text color={anniversary != "" ? "#111111" : "#999999"} fontSize="md">{anniversary != "" ? moment(anniversary).format("DD MMMM, YYYY") : t("Select Date")}</Text>
                            </HStack>
                        </Pressable>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                        <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="4">
                            <LinearGradient
                                colors={["#821700", "#f04e23"]}
                                start={{ x: 0.5, y: 0 }}
                                style={styles.optionbtn}
                            >
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onAnniversaryCancel()}>{t("Close")}</Button>
                            </LinearGradient>
                            <LinearGradient
                                colors={["#10764F", "#2BBB86"]}
                                start={{ x: 0.5, y: 0 }}
                                style={styles.optionbtn}
                            >
                                <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onAnniversarySubmit()}>{t("Save")}</Button>
                            </LinearGradient>
                        </HStack>
                    </Box>
                </VStack>
            )}
            {emailPop && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                        <Box style={styles.productbox}>
                            <Text color={darkColor} fontSize="16" fontWeight="medium" textAlign="center" mb="4" pb="3" borderBottomWidth={1} borderColor={"#aaaaaa"}>{t("Enter Email")}</Text>
                            <View style={styles.inputbox}>
                                <Input size="lg" placeholder={t("Email")} onChangeText={(text) => setEmail(text)} InputLeftElement={<Icon name="mail-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} />
                            </View>
                            <HStack space={1} alignItems="center" justifyContent="space-evenly" bg="#eeeeee" borderRadius="10" overflow="hidden" padding="2" mt="4">
                                <LinearGradient
                                    colors={["#821700", "#f04e23"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onEmailCancel()}>{t("Close")}</Button>
                                </LinearGradient>
                                <LinearGradient
                                    colors={["#10764F", "#2BBB86"]}
                                    start={{ x: 0.5, y: 0 }}
                                    style={styles.optionbtn}
                                >
                                    <Button size="xs" variant="link" _text={{ color: "#ffffff", fontWeight: 'bold', fontSize: 13 }} onPress={() => onEmailSubmit()}>{t("Save")}</Button>
                                </LinearGradient>
                            </HStack>
                        </Box>
                    </VStack>
                </TouchableWithoutFeedback>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    bgimage: { flex: 1, justifyContent: 'center' },
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 7 },
    custbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    productbox: { borderRadius: 15, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#ffffff', borderWidth: 2, elevation: 10, shadowColor: '#666666', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' }
});

export default ProfileDetailsScreen;

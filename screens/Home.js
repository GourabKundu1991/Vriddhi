import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Stack, Avatar, Menu, Button, Checkbox, Switch, Popover, Tooltip } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Linking, Platform, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { API_KEY, APP_VERSION, BASE_URL, CONTACT_HIER_ID, ORG_ID, OS_TYPE, PROGRAM_ID } from '../auth_provider/Config';
import Carousel from 'react-native-snap-carousel';
import Events from '../auth_provider/Events';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import '../assets/language/i18n';
import moment from 'moment';

//import PushControllerService from '../auth_provider/PushController';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import i18n from '../assets/language/i18n';
import OrgTabComponents from '../components/OrgTab';

const HomeScreen = ({ navigation }) => {

    //PushControllerService({ navigation });

    const BannerWidth = Dimensions.get('window').width;
    const BannerHeight = 220;

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);

    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");

    const [userType, setUserType] = React.useState("");

    const [logoImage, setLogoImage] = React.useState("");
    const [allBanners, setAllBanners] = React.useState([]);
    const [homeMenu, setHomeMenu] = React.useState([]);
    const [pendingSale, setPendingSale] = React.useState("");

    const [profileDetails, setProfileDetails] = React.useState("");
    const [profilePic, setProfilePic] = React.useState("");

    const [birthDay, setBirthDay] = React.useState("");
    const [anniversaryDay, setAnniversaryDay] = React.useState("");

    const [leadsData, setLeadsData] = React.useState("");
    const [helpLine, setHelpLine] = React.useState([]);

    const [popStoreBirth, setPopStoreBirth] = React.useState(false);
    const [popStoreAnniversary, setPopStoreAnniversary] = React.useState(false);

    const [memberCounts, setMemberCounts] = React.useState([]);

    const [isPending, setIsPending] = React.useState(false);
    const [isKYC, setIsKYC] = React.useState(false);

    const [voucherPop, setVoucherPop] = React.useState(false);
    const [awareCheck, setAwareCheck] = React.useState(false);

    const [duplicateAccount, setDuplicateAccount] = React.useState([]);

    const [isSwitch, setIsSwitch] = React.useState(false);

    const [isOpen, setIsOpen] = React.useState(true);

    const [orgName, setOrgName] = React.useState("");

    const [consentPOP, setConsentPOP] = React.useState(false);
    const [consentDetails, setConsentDetails] = React.useState("");

    const [memberType, setMemberType] = React.useState("");
    const [selectedORG, setSelectedORG] = React.useState("");

    const [tierUrl, setTierUrl] = React.useState("");

    const goBannerDetails = (dataValue) => {
        if (dataValue.open_type == 1) {
            Linking.openURL(dataValue.android_target_link);
        }
    }

    const renderBanner = ({ item, index }) => {
        return (
            <View key={index} style={styles.sliderbanner}>
                <TouchableOpacity onPress={() => goBannerDetails(item)}>
                    <Image style={{ width: BannerWidth, height: BannerHeight, resizeMode: 'contain', marginLeft: -40 }} source={item.image ? { uri: item.image } : require('../assets/images/noimage.jpg')} />
                </TouchableOpacity>
            </View>
        );
    }

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const requestNotificationPermission = async () => {
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result;
    };

    const checkNotificationPermission = async () => {
        const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result;
    };

    const requestPermission = async () => {
        const checkPermission = await checkNotificationPermission();
        if (checkPermission !== RESULTS.GRANTED) {
            const request = await requestNotificationPermission();
            if (request !== RESULTS.GRANTED) {
                // permission not granted
            }
        }
    };

    useEffect(() => {
        requestPermission();
        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    i18n
                        .changeLanguage(val)
                        .then(() => console.log(val))
                        .catch(err => console.log(err));
                } else {
                    i18n
                        .changeLanguage("Eng")
                        .then(() => console.log())
                        .catch(err => console.log());
                }
            });
            setLoading(true);
            let formdata = new FormData();
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("app_ver", `${APP_VERSION}`);
            formdata.append("os_type", `${OS_TYPE}`);
            fetch(`${BASE_URL}/app_version_check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formdata
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    //console.log("Version Check:", responseJson);
                    if (responseJson.version_details.update_available == 0) {
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                setMemberType(JSON.parse(val).member_type);
                                if (JSON.parse(val).member_type == "CSO") {
                                    AsyncStorage.getItem('selectedOrg').then(orgVal => {
                                        console.log("orgVal:", orgVal)
                                        if (orgVal != null) {
                                            setSelectedORG(JSON.parse(orgVal));
                                            getAllData(JSON.parse(orgVal));
                                        } else {
                                            setSelectedORG(JSON.parse(val).default_org_selection[0].id);
                                            getAllData(JSON.parse(val).default_org_selection[0].id);
                                        }
                                    })
                                } else {
                                    setSelectedORG(JSON.parse(val).org_id);
                                    getAllData(JSON.parse(val).org_id);
                                }
                            }
                        })
                    } else {
                        setLoading(false);
                        AsyncStorage.clear();
                        navigation.replace('Login');
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    //console.log("Version Check Error:", error);
                });

        });
        return unsubscribe;
    }, []);

    const getAllData = (forORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setLogoImage(JSON.parse(val).logo_url);
                setLightColor(JSON.parse(val).info.theme_color.light);
                setDarkColor(JSON.parse(val).info.theme_color.dark);
                Events.publish('lightColor', JSON.parse(val).info.theme_color.light);
                Events.publish('darkColor', JSON.parse(val).info.theme_color.dark);

                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("defaultOrgSelection", forORG);
                console.log(formdata);
                fetch(`${BASE_URL}/get_dashboard_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("Dashboard:", responseJson);
                        if (responseJson.status == 'success') {
                            setTierUrl(responseJson.tier_url);
                            setOrgName(responseJson.login_org);
                            if (responseJson.is_approved == 2) {
                                setIsKYC(true);
                                Events.publish('mainMenu', []);
                            } else {
                                if (responseJson.is_approved == 0) {
                                    setIsPending(true);
                                }
                                if (responseJson.force_pan_status == 1) {
                                    navigation.replace('PanUpload', { root: "true" });
                                    Events.publish('mainMenu', []);
                                } else {
                                    if (responseJson.voucher_expiry_pop_up_status == true) {
                                        AsyncStorage.getItem('voucher').then(valVou => {
                                            if (valVou != null) {
                                                if (valVou == moment(new Date()).format('DD, MMMM')) {
                                                    Events.publish('mainMenu', responseJson.menu);
                                                    Events.publish('pending_otp_approval', responseJson.pending_otp_approval);
                                                } else {
                                                    setVoucherPop(true);
                                                    Events.publish('mainMenu', []);
                                                }
                                            } else {
                                                setVoucherPop(true);
                                                Events.publish('mainMenu', []);
                                            }
                                        })
                                    } else {
                                        Events.publish('mainMenu', responseJson.menu);
                                        Events.publish('pending_otp_approval', responseJson.pending_otp_approval);
                                    }
                                }
                            }
                            setAllBanners(responseJson.banners);
                            setHomeMenu(responseJson.home_menu);
                            setUserType(responseJson.logged_user_type);
                            setDuplicateAccount(responseJson.has_duplicate_account);
                            Events.publish('userType', responseJson.logged_user_type);
                            setBirthDay(responseJson.dob_popup);
                            setAnniversaryDay(responseJson.anniversary_popup);
                            if (responseJson.consent.member_register_consent == 0) {
                                setConsentPOP(true);
                                setConsentDetails(responseJson.consent.member_register_consent_data);
                            }
                            AsyncStorage.getItem('findBirth').then(val => {
                                if (val == null && responseJson.dob_popup == 1) {
                                    setPopStoreBirth(true);
                                    Animated.timing(fadeAnim, {
                                        toValue: 1,
                                        duration: 20000,
                                        useNativeDriver: true,
                                    }).start();
                                } else {
                                    setPopStoreBirth(false);
                                }
                            });
                            AsyncStorage.getItem('findAnniversary').then(val => {
                                if (val == null && responseJson.anniversary_popup == 1) {
                                    setPopStoreAnniversary(true);
                                    Animated.timing(fadeAnim, {
                                        toValue: 1,
                                        duration: 20000,
                                        useNativeDriver: true,
                                    }).start();
                                } else {
                                    setPopStoreAnniversary(false);
                                }
                            });
                            setHelpLine(responseJson.help_desk);
                            setLeadsData(responseJson.leads);
                            setPendingSale(responseJson.pending_registered_sale);
                            if (responseJson.logged_user_type = "CSO") {
                                setMemberCounts(responseJson.total_member_counts);
                            }
                            fetch(`${BASE_URL}/profile`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                body: formdata
                            })
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    setLoading(false);
                                    //console.log("Profile:", responseJson);
                                    if (responseJson.status == 'success') {
                                        setProfileDetails(responseJson.profile);
                                        setProfilePic(responseJson.profile.BaseUrl + responseJson.profile.profile_pic);
                                        Events.publish('profileData', JSON.stringify(responseJson));
                                    } else {
                                        Toast.show({ description: responseJson.message });
                                    }
                                })
                                .catch((error) => {
                                    setLoading(false);
                                    //console.log("Profile Error:", error);
                                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                });
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
                        //console.log("Dashboard Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const closeBirthDay = () => {
        setPopStoreBirth(false);
        AsyncStorage.setItem('findBirth', "Yes");
    }
    const closeAnniversaryDay = () => {
        setPopStoreAnniversary(false);
        AsyncStorage.setItem('findAnniversary', "Yes");
    }

    const onLogout = () => {
        Alert.alert(
            t("Alert"),
            t("Are you sure to logout") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        AsyncStorage.clear();
                        navigation.closeDrawer();
                        navigation.navigate('Login');
                    }
                }
            ],
            { cancelable: false }
        );
    }

    const updateKYC = () => {
        navigation.replace('UpdateKYC');
    }

    const onUnlock = () => {
        if (awareCheck == false) {
            Toast.show({ description: t("Please check 'I am aware of'") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    fetch(`${BASE_URL}/addVoucherExpiryDetails`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formdata
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            console.log("addVoucherExpiryDetails:", responseJson);
                            if (responseJson.status == 'success') {
                                AsyncStorage.setItem('voucher', moment(new Date()).format('DD, MMMM'));
                                setVoucherPop(false);
                                navigation.navigate('GiftVouchers');
                                setAwareCheck(false);
                                setLoading(false);
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("addVoucherExpiryDetails Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Login');
                }
            });
        }
    }

    const onSwitchAcct = () => {
        setIsOpen(false);
        Alert.alert(
            t("Warning"),
            t("Do you want to switch your account") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                formdata.append("token", JSON.parse(val).token);
                                fetch(`${BASE_URL}/switch_account`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    body: formdata
                                })
                                    .then((response) => response.json())
                                    .then((responseJson) => {
                                        console.log("switch_account:", responseJson);
                                        if (responseJson.status == 'success') {
                                            AsyncStorage.setItem('userToken', JSON.stringify(responseJson));
                                            getAllData(selectedORG);
                                        }
                                    })
                                    .catch((error) => {
                                        setLoading(false);
                                        //console.log("switch_account Error:", error);
                                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                    });
                            } else {
                                setLoading(false);
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    const onGoPortfolio = (itemValue) => {
        if (itemValue.type != 5) {
            navigation.navigate("Portfolio", { pageTitle: itemValue.name, pageType: itemValue.type })
        }
    }

    const acceptConsent = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("token", JSON.parse(val).token);
                formdata.append("orgId", JSON.parse(val).org_id);
                console.log(formdata);
                fetch(`${BASE_URL}/verify_register_consent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log("verify_register_consent:", responseJson);
                        if (responseJson.status == 'success') {
                            setConsentPOP(false);
                            getAllData(selectedORG);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("verify_register_consent Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }

    const onCheck = (e) => {
        setLoading(true);
        getAllData(e);
        setSelectedORG(e);
        AsyncStorage.setItem('selectedOrg', JSON.stringify(e));
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box flex={1} bg={userType != 'Engineer' ? "#ffffff" : "#f6f6f6"}>
                <LinearGradient
                    colors={["#ffffff", lightColor]}
                    start={{ x: 0.5, y: 0 }}
                >
                    <HStack justifyContent="space-between" alignItems="center" paddingX="4" paddingY={3} space={2} style={{ height: 80 }}>
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ width: 80 }}>
                            <Icon name="menu" size={28} color="#111111" />
                        </TouchableOpacity>
                        {userType == 'CSO' ?
                            <Image source={require('../assets/images/logoCSO.png')} style={styles.csologo} />
                            :
                            <Image source={logoImage ? { uri: logoImage } : require('../assets/images/logoCSO.png')} style={userType == 'Engineer' ? styles.englogo : styles.logo} />
                        }
                        <HStack style={{ width: 80 }} justifyContent={"flex-end"} space={3}>
                            {userType == 'CSO' ?
                                <TouchableOpacity onPress={() => onLogout()}>
                                    <Icon name="power" size={28} color="#111111" />
                                </TouchableOpacity>
                                :
                                <Menu w="200" trigger={triggerProps => {
                                    return <TouchableOpacity {...triggerProps}>
                                        <Box width={28} h={28} borderColor="#111111" borderWidth={1} borderRadius={10} overflow='hidden' justifyContent="center" alignItems="center">
                                            <Icon name="call" size={20} color="#111111" />
                                        </Box>
                                    </TouchableOpacity>;
                                }}>
                                    {helpLine.map((item, index) =>
                                        <Menu.Item key={index} onPress={() => { Linking.openURL(`tel:${item.no}`) }}>
                                            <HStack justifyContent="space-between" alignItems="center" w="100%">
                                                <Text color="#111111" fontSize="sm" fontWeight="bold">{item.title}</Text>
                                                <Icon name="call" size={18} color={darkColor} />
                                            </HStack>
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                        </HStack>
                    </HStack>
                    {userType == 'Engineer' && birthDay == 1 && (
                        <HStack justifyContent="center" alignItems="center" space={3} pb="4" >
                            <Image source={require('../assets/images/birthdaytag.png')} style={{ width: '100%', height: 55, resizeMode: 'contain' }} />
                        </HStack>
                    )}
                    {userType == 'Engineer' && anniversaryDay == 1 && (
                        <HStack justifyContent="center" alignItems="center" space={3} pb="4" >
                            <Image source={require('../assets/images/anniversarytag.png')} style={{ width: '100%', height: 55, resizeMode: 'contain' }} />
                        </HStack>
                    )}
                </LinearGradient>
                <ScrollView>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        style={{ height: 150, position: 'absolute', top: 0, width: '100%', borderBottomEndRadius: 100, borderBottomStartRadius: 100, overflow: 'hidden' }}
                        start={{ x: 0.5, y: 0 }}
                    >
                        {userType == 'Engineer' && (
                            <HStack marginTop={duplicateAccount.length > 1 ? 8 : 0} padding={3} justifyContent="center" alignItems="center" space={3}>
                                <Avatar style={styles.avatar} w={65} h={65} source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}></Avatar>
                                <VStack>
                                    <Text color="#111111" fontSize="lg" fontWeight="bold" textTransform="capitalize">{profileDetails.firstName} {profileDetails.lastName}</Text>
                                    <Text color="#444444" fontSize="xs" fontWeight="medium" textTransform="capitalize">( {t("Member Code")}: {profileDetails.ID} )</Text>
                                </VStack>
                            </HStack>

                        )}
                    </LinearGradient>
                    <Stack>
                        {memberType == "CSO" ?
                            <OrgTabComponents clickBtn={onCheck} navigation={navigation} component={selectedORG} />
                            :
                            <Stack>
                                {duplicateAccount.length > 1 && (
                                    <HStack justifyContent="center" alignItems="center" space={3}>
                                        <Text color="#000000" fontSize={orgName == "nuvoco" ? 16 : 12} fontWeight={orgName == "nuvoco" ? "bold" : "normal"}>VRIDDHI</Text>
                                        <Pressable onPress={() => onSwitchAcct()} position="relative">
                                            <View style={{ backgroundColor: orgName == "nuvoco" ? '#2BBB86' : '#ec2832', display: 'flex', alignItems: orgName == "nuvoco" ? 'flex-start' : 'flex-end', borderRadius: 30, overflow: 'hidden', width: 70, height: 30, borderColor: '#ffffff', borderWidth: 1, padding: 4 }}>
                                                <View style={{ backgroundColor: '#ffffff', width: 20, height: 20, borderRadius: 30, overflow: 'hidden' }}></View>
                                            </View>
                                        </Pressable>
                                        <Text color="#000000" fontSize={orgName == "nipun" ? 16 : 12} fontWeight={orgName == "nipun" ? "bold" : "normal"}>NIPUN</Text>
                                    </HStack>
                                )}
                            </Stack>
                        }
                    </Stack>
                    <Box style={{ marginTop: userType == 'Engineer' ? 85 : 10 }}>
                        <Carousel
                            layout={"default"}
                            data={allBanners}
                            sliderWidth={BannerWidth}
                            itemWidth={320}
                            autoplay={true}
                            loop={true}
                            renderItem={renderBanner} />
                    </Box>
                    {userType == 'CSO' && (
                        <Box paddingY="3" paddingX="6" mt="5">
                            <Box style={{ zIndex: 9 }}>
                                <Text color="#111111" bg="#ffffff" paddingX="5" alignSelf="center" textAlign="center" fontSize="16" fontWeight="bold">{t("My Portfolio")}</Text>
                            </Box>
                            <Stack style={{ backgroundColor: '#cccccc', paddingTop: 1, borderTopStartRadius: 14, borderTopEndRadius: 14, borderBottomStartRadius: 15, borderBottomEndRadius: 15, marginTop: -12, overflow: 'hidden' }}>
                                <LinearGradient
                                    colors={['#ffffff', '#eeeeee']}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ padding: 10, paddingTop: 28, borderRadius: 15, overflow: 'hidden' }}
                                >
                                    <View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {memberCounts.map((item, index) =>
                                                <TouchableOpacity key={index} onPress={() => onGoPortfolio(item)} style={{ marginRight: memberCounts.length - 1 == index ? 0 : 8 }}>
                                                    <LinearGradient
                                                        colors={[lightColor, '#eeeeee']}
                                                        start={{ x: 0.5, y: 0 }}
                                                        style={styles.dashElement}
                                                    >
                                                        <VStack justifyContent="center" alignItems="center">
                                                            <Stack style={{ backgroundColor: '#111111', borderRadius: 10, minWidth: 60, height: 50, position: 'relative', zIndex: 9, paddingHorizontal: 5 }}>
                                                                <Text color="#ffffff" fontSize="16" lineHeight="50" textAlign="center" fontWeight="bold">{item.count}</Text>
                                                            </Stack>
                                                            <VStack style={styles.dashInner} justifyContent="center" alignItems="center">
                                                                <Text color="#111111" fontSize="11" textAlign="center" fontWeight="bold">{item.name}</Text>
                                                            </VStack>
                                                        </VStack>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                        </ScrollView>
                                    </View>
                                </LinearGradient>
                            </Stack>
                        </Box>
                    )}
                    {userType == 'Engineer' && (
                        <Box paddingY="3" paddingX="5" mt="3">
                            <HStack bg="#f6f6f6" paddingX="5" alignSelf="center" style={{ zIndex: 9 }}>
                                <Image source={require('../assets/images/neev.png')} style={{ width: 40, height: 20, resizeMode: 'contain' }} />
                                <Text color="#111111" textAlign="center" fontSize="16" fontWeight="bold"> - {t("My Leads")}</Text>
                            </HStack>
                            <Stack style={{ backgroundColor: '#cccccc', paddingTop: 1, borderTopStartRadius: 14, borderTopEndRadius: 14, borderBottomStartRadius: 15, borderBottomEndRadius: 15, marginTop: -12, overflow: 'hidden' }}>
                                <LinearGradient
                                    colors={['#f6f6f6', '#ffffff', '#ffffff']}
                                    start={{ x: 0.5, y: 0 }}
                                    style={{ padding: 10, paddingTop: 28, borderRadius: 15, overflow: 'hidden' }}
                                >
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={styles.leadbox}
                                        >
                                            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => navigation.navigate("RegisterLeads")}>
                                                <VStack flex={1} justifyContent="center" alignItems="center">
                                                    <Icon name="duplicate-outline" size={50} color="#ffffff" />
                                                    <Text fontWeight="bold" color="#ffffff" mt="2" fontSize="lg" textAlign="center">{t("Register Lead")}</Text>
                                                </VStack>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={styles.leadbox}
                                        >
                                            <Icon name="layers-outline" size={60} color="#444444" style={{ opacity: 0.3, position: 'absolute', top: 5, left: 5 }} />
                                            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => navigation.navigate("MyLeads", { type: "All" })}>
                                                <VStack flex={1} justifyContent="flex-end">
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="4xl" textAlign="right">{leadsData.all_leads}</Text>
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="lg" textAlign="right">{t("All Leads")}</Text>
                                                </VStack>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={styles.leadbox}
                                        >
                                            <Icon name="trophy-outline" size={60} color="#444444" style={{ opacity: 0.3, position: 'absolute', top: 8, left: 5 }} />
                                            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => navigation.navigate("MyLeads", { type: "Approve" })}>
                                                <VStack flex={1} justifyContent="flex-end">
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="4xl" textAlign="right">{leadsData.approved_leads}</Text>
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="lg" textAlign="right">{t("Approved")}</Text>
                                                </VStack>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                        <LinearGradient
                                            colors={[lightColor, darkColor]}
                                            start={{ x: 0.5, y: 0 }}
                                            style={styles.leadbox}
                                        >
                                            <Icon name="hourglass-outline" size={60} color="#444444" style={{ opacity: 0.3, position: 'absolute', top: 8, left: 5 }} />
                                            <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => navigation.navigate("MyLeads", { type: "Open" })}>
                                                <VStack flex={1} justifyContent="flex-end">
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="4xl" textAlign="right">{leadsData.open_leads}</Text>
                                                    <Text fontWeight="bold" color="#ffffff" fontSize="lg" textAlign="right">{t("Pending")}</Text>
                                                </VStack>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </ScrollView>
                                </LinearGradient>
                            </Stack>
                        </Box>
                    )}
                    <Box paddingY="3" paddingX="5" mt="5">
                        {userType != 'CSO' && (
                            <Button onPress={() => Linking.openURL(tierUrl)} size="sm" style={{ backgroundColor: "#111111", borderRadius: 10, overflow: 'hidden' }} marginBottom={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="bold">{t("Tier Status")}</Text>
                            </Button>
                        )}
                        <Box style={{ zIndex: 9 }}>
                            <Text color="#111111" bg={userType == 'Engineer' ? "#f6f6f6" : "#ffffff"} paddingX="5" alignSelf="center" textAlign="center" fontSize="16" fontWeight="bold">{t('Quick Links')}</Text>
                        </Box>
                        <Stack style={{ backgroundColor: '#cccccc', paddingTop: 1, borderTopStartRadius: 14, borderTopEndRadius: 14, borderBottomStartRadius: 15, borderBottomEndRadius: 15, marginTop: -12, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={userType == 'Engineer' ? ['#f6f6f6', '#ffffff', '#ffffff'] : ['#ffffff', '#eeeeee', '#eeeeee']}
                                start={{ x: 0.5, y: 0 }}
                                style={{ padding: 10, paddingTop: 28, borderRadius: 15, overflow: 'hidden' }}
                            >
                                {userType == 'CSO' ?
                                    <HStack flexWrap="wrap" alignItems="center" justifyContent="center">
                                        {homeMenu.map((item, index) =>
                                            <LinearGradient
                                                colors={userType == "Engineer" ? ["#ffffff", lightColor] : ["#ffffff", lightColor, darkColor]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={[styles.linkbox, { width: '46%', height: 150 }]}
                                                borderColor={lightColor}
                                                key={index}
                                            >
                                                <TouchableOpacity onPress={() => navigation.navigate(item.component)}>
                                                    <VStack space={2} justifyContent="center" alignItems="center" margin="2">
                                                        <Box style={styles.linkicon}>
                                                            {userType == "CSO" && item.component == "CSOSaleConfirmList" && pendingSale != 0 && (
                                                                <Text style={styles.bedge} color="#ffffff" bg="#f04e23">{pendingSale}</Text>
                                                            )}
                                                            {userType == "CSO" && item.component == "MyLeads" && leadsData.open_leads != 0 && (
                                                                <Text style={styles.bedge} color="#ffffff" bg="#f04e23">{leadsData.open_leads}</Text>
                                                            )}
                                                            <Icon name={item.icon} size={32} color={userType == 'Engineer' ? darkColor : "#444444"} />
                                                        </Box>
                                                        <Text color="#111111" fontSize="14" textAlign="center" fontWeight="bold">{item.title}</Text>
                                                    </VStack>
                                                </TouchableOpacity>
                                            </LinearGradient>
                                        )}
                                    </HStack>
                                    :
                                    <HStack flexWrap="wrap" alignItems="center" justifyContent="center">
                                        {homeMenu.map((item, index) =>
                                            <LinearGradient
                                                colors={orgName == 'nuvoco' ? userType == "Engineer" ? ["#ffffff", lightColor] : ["#ffffff", lightColor, darkColor] : userType == 'Contractor' ? [darkColor, "#444444"] : ["#ffffff", lightColor, darkColor]}
                                                start={{ x: 0.5, y: 0 }}
                                                style={styles.linkbox}
                                                borderColor={lightColor}
                                                key={index}
                                            >
                                                <TouchableOpacity onPress={() => navigation.navigate(item.component)}>
                                                    <VStack space={2} justifyContent="center" alignItems="center" margin="2">
                                                        <Box style={[styles.linkicon, { borderColor: orgName == 'nuvoco' ? "#666666" : userType == 'Contractor' ? "#ffffff" : "#666666" }]}>
                                                            <Icon name={item.icon} size={32} color={orgName == 'nuvoco' ? userType == 'Engineer' ? darkColor : "#444444" : userType == 'Contractor' ? "#ffffff" : "#444444"} />
                                                        </Box>
                                                        <Text color={orgName == 'nuvoco' ? "#111111" : userType == 'Contractor' ? "#ffffff" : "#111111"} fontSize="11" textAlign="center" fontWeight="bold" style={{ paddingHorizontal: 2 }}>{item.title}</Text>
                                                    </VStack>
                                                </TouchableOpacity>
                                            </LinearGradient>
                                        )}
                                    </HStack>
                                }
                            </LinearGradient>
                        </Stack>
                    </Box>
                </ScrollView>
            </Box>
            {isPending && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="hourglass-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Pending")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your EKYC is in Pending Mode. Please click continue to use app")}.</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => setIsPending(false)} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {isKYC && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="hourglass-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Warning")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your E-KYC Rejected / Not verified. Please click on Continue to update.")}</Text>
                            <Button size="sm" style={{ backgroundColor: '#111111', width: 100, borderRadius: 10, overflow: 'hidden' }} onPress={() => updateKYC()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {voucherPop && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={["#ffffff", lightColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="5" alignItems="center" justifyContent="center">
                            <Icon name="warning-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Voucher Expiry Reminder")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your Gift Voucher id locked. You can unlock it now and use your gift voucher before it get expired")}.</Text>
                            <Stack marginY="4" flexWrap="wrap" backgroundColor={"rgba(255,255,255,0.7)"} style={{ paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, overflow: 'hidden' }}>
                                <Checkbox colorScheme="orange" shadow={2} onChange={() => setAwareCheck(!awareCheck)} accessibilityLabel="Checkbox">
                                    {t("I am aware of")}
                                </Checkbox>
                            </Stack>
                            <HStack justifyContent={"space-evenly"} width={"100%"}>
                                <Button size="sm" variant="outline" style={{ borderColor: '#111111', width: 120, borderRadius: 10, overflow: 'hidden' }} onPress={() => onLogout()} marginY={4}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Logout")}</Text>
                                </Button>
                                <Button size="sm" style={{ backgroundColor: '#111111', width: 120, borderRadius: 10, overflow: 'hidden' }} onPress={() => onUnlock()} marginY={4}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Unlock Now")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {userType == 'Engineer' && popStoreBirth && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 99, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/images/birthday.gif')} style={{ width: '80%', height: '80%', resizeMode: 'contain' }} />
                    <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
                        <TouchableOpacity onPress={() => closeBirthDay()}>
                            <Icon name="close-circle-outline" size={40} color="#ffffff" />
                        </TouchableOpacity>
                    </Animated.View>
                </VStack>
            )}
            {userType == 'Engineer' && popStoreAnniversary && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 99, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/images/anniversary.gif')} style={{ width: '80%', height: '80%', resizeMode: 'contain' }} />
                    <Animated.View style={{ opacity: fadeAnim, marginTop: 10 }}>
                        <TouchableOpacity onPress={() => closeAnniversaryDay()}>
                            <Icon name="close-circle-outline" size={40} color="#ffffff" />
                        </TouchableOpacity>
                    </Animated.View>
                </VStack>
            )}
            {consentPOP && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={[lightColor, darkColor]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="shield-checkmark-outline" size={100} color="#111111"></Icon>
                            <Text mt={8} mb={5} fontSize="lg" fontWeight="bold" color="#111111">{consentDetails.title}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{consentDetails.consent}</Text>
                            <HStack justifyContent="space-evenly" width="100%">
                                <Button size="sm" variant="outline" style={{ borderColor: '#111111', width: 110, borderRadius: 10, overflow: 'hidden' }} onPress={() => onLogout()} marginY={4}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Logout")}</Text>
                                </Button>
                                <Button size="sm" style={{ backgroundColor: '#111111', width: 110, borderRadius: 10, overflow: 'hidden' }} onPress={() => acceptConsent()} marginY={4}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Accept")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={darkColor} />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    banner: { marginTop: -150 },
    logo: { width: 96, height: 38, resizeMode: 'contain' },
    englogo: { width: 160, height: 50, resizeMode: 'contain' },
    csologo: { width: 180, height: 50, resizeMode: 'contain' },
    sliderbanner: { borderRadius: 20, overflow: 'hidden', borderColor: '#ffffff', borderWidth: 1, elevation: 10, marginVertical: 15, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, height: 220, backgroundColor: '#eeeeee' },
    linkbox: { borderRadius: 15, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
    linkicon: { borderColor: '#666666', borderWidth: 1, borderRadius: 10, width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    dashElement: { padding: 5, paddingTop: 7, borderRadius: 12, overflow: 'hidden', marginVertical: 5 },
    dashInner: { marginTop: -12, padding: 5, paddingTop: 15, width: 85, height: 80, borderRadius: 10, backgroundColor: '#ffffff', overflow: 'hidden' },
    avatar: { elevation: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, borderColor: "#ffffff", borderWidth: 4, backgroundColor: '#ffffff' },
    listview: { elevation: 10, marginVertical: 6, padding: 10, shadowColor: '#999999', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, backgroundColor: '#ffffff', borderRadius: 15, overflow: 'hidden' },
    leadbox: { width: 120, height: 150, borderRadius: 10, overflow: 'hidden', margin: 5, position: 'relative', padding: 15 },
    bedge: { position: 'absolute', right: -10, top: -10, zIndex: 9, borderRadius: 12, overflow: 'hidden', width: 30, height: 22, fontSize: 12, fontWeight: 'bold', textAlign: 'center', lineHeight: 20 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 99 },
});

export default HomeScreen;
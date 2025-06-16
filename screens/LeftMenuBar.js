import { Avatar, Box, HStack, NativeBaseProvider, Pressable, Stack, Text, VStack, View } from 'native-base';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import Events from '../auth_provider/Events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

const LeftMenuBarScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [locationData, setLocationData] = React.useState([]);
    const [lightColor, setLightColor] = React.useState("#cbf75e");
    const [darkColor, setDarkColor] = React.useState("#2BBB86");

    const [mainMenu, setMainMenu] = React.useState([]);
    const [profileData, setProfileData] = React.useState([]);
    const [profilePic, setProfilePic] = React.useState("");
    const [pointData, setPointData] = React.useState([]);
    const [userType, setUserType] = React.useState("");
    const [pendingOTP, setpendingOTP] = React.useState("");

    useEffect(() => {
        Events.subscribe('mainMenu', (data) => {
            setMainMenu(data);
        });
        Events.subscribe('pending_otp_approval', (data) => {
            setpendingOTP(data);
        });
        Events.subscribe('profileData', (data) => {
            setProfileData(JSON.parse(data).profile);
            if (JSON.parse(data).profile.profile_pic) {
                setProfilePic(JSON.parse(data).profile.BaseUrl + JSON.parse(data).profile.profile_pic);
            }
            setPointData(JSON.parse(data).points);
        });
        Events.subscribe('lightColor', (data) => {
            setLightColor(data);
        });
        Events.subscribe('darkColor', (data) => {
            setDarkColor(data);
        });
        Events.subscribe('userType', (data) => {
            setUserType(data);
        });
    }, []);

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

    return (
        <NativeBaseProvider>
            <Box flex={1} bg="white" overflow="hidden">
                <LinearGradient
                    colors={["#ffffff", lightColor, darkColor]}
                    start={{ x: 0.5, y: 0 }}
                    flex={1}
                >
                    <Stack paddingX={4} paddingTop={8} paddingBottom={2}>
                        <HStack space={3} alignItems="center">
                            <Avatar borderColor="#111111" resizeMode="contain" borderWidth="2" size="md" source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}>
                            </Avatar>
                            <VStack w="70%" justifyContent="center" space={0.5} paddingRight="10">
                                <Text color="#111111" fontSize="md" fontWeight="bold">{profileData.firstName} {profileData.lastName}</Text>
                                <Text color="#444444" fontSize="xs" fontWeight="medium">{t("Member ID")}: {profileData.ID}</Text>
                                {userType != "CSO" && (
                                    <View>
                                        {/* <HStack space={2}>
                                            <Text color="#444444" fontSize="sm">{t("Total Points")}:</Text>
                                            <Text color="#111111" fontSize="sm" fontWeight="medium">{pointData.total_point ? pointData.total_point : "0"}</Text>
                                        </HStack> */}
                                        <HStack space={2}>
                                            <Text color="#444444" fontSize="sm">{t("Available Points")}:</Text>
                                            <Text color="#111111" fontSize="sm" fontWeight="medium">{pointData.available_point ? pointData.available_point : "0"}</Text>
                                        </HStack>
                                    </View>
                                )}
                            </VStack>
                        </HStack>
                    </Stack>

                    <ScrollView>
                        <Stack padding={6}>
                            {mainMenu.map((item, index) =>
                                <Pressable key={index} onPress={() => navigation.navigate(item.url)} borderColor="#444444" borderBottomWidth="0.5" paddingY={3}>
                                    <HStack space={3} alignItems="center" position="relative">
                                        <Icon name={item.icon} size={20} color="#111111" />
                                        <Text style={{ width: '85%' }} color="#111111" fontSize="sm" fontWeight="medium">{item.title}</Text>
                                        {item.title == "Pending OTP Approval" && (
                                            <Text style={styles.bedge} color="#ffffff" bg="#f04e23">{Number(pendingOTP)}</Text>
                                        )}
                                    </HStack>
                                </Pressable>
                            )}
                            <Pressable onPress={() => onLogout()} paddingY={3}>
                                <HStack space={3} alignItems="center">
                                    <Icon name="power" size={20} color="#111111" />
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Logout")}</Text>
                                </HStack>
                            </Pressable>
                        </Stack>
                    </ScrollView>
                </LinearGradient>
            </Box>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    icon: { width: 60, height: 60, resizeMode: 'cover' },
    okbtn: { backgroundColor: '#f9d162', borderRadius: 50, overflow: 'hidden', width: '80%', justifyContent: 'center', alignItems: 'center', height: 45 },
    bedge: { position: 'absolute', right: 0, zIndex: 9, borderRadius: 12, overflow: 'hidden', width: 30, height: 22, fontSize: 12, fontWeight: 'bold', textAlign: 'center', lineHeight: 20 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default LeftMenuBarScreen;
import { Box, Button, HStack, Image, Stack, Text } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImageBackground, TouchableOpacity } from 'react-native';
import { fontSemiBold, lightColor } from '../assets/MainStyle';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const OrgTabComponents = ({ navigation, clickBtn, component }) => {

    const { t } = useTranslation();

    const [orgList, setOrgList] = React.useState([]);

    useEffect(() => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                if (JSON.parse(val).member_type == "CSO") {
                    setOrgList(JSON.parse(val).default_org_selection);
                }
            }
        });
    }, []);

    return (
        <Stack>
            {orgList.length > 1 && (
                <Box style={{paddingHorizontal: 20, marginTop: 10}}>
                    <HStack alignItems="center" justifyContent="space-evenly">
                        {orgList.map((item, index) =>
                            <LinearGradient
                                key={index}
                                colors={component == item.id ? ["#555555", "#000000"] : ["#eeeeee", "#bbbbbb"]}
                                start={{ x: 0.5, y: 0 }}
                                style={{ width: '28%', borderRadius: 8, overflow: 'hidden' }}
                            >
                                <Button size="xs" variant="link" _text={{ color: component == item.id ? "#ffffff" : "#111111", fontWeight: 'bold', fontSize: 12 }} onPress={() => clickBtn(item.id)}>{item.name}</Button>
                            </LinearGradient>
                        )}
                    </HStack>
                </Box>
            )}
        </Stack>
    );
}

export default OrgTabComponents;
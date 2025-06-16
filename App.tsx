/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LogBox, Platform, SafeAreaView, StatusBar, View } from 'react-native';

import IntroScreen from './screens/Intro';
import LoginScreen from './screens/Login';
import LeftMenuBarScreen from './screens/LeftMenuBar';
import HomeScreen from './screens/Home';
import RewardScreen from './screens/Rewards';
import ProductDetailsScreen from './screens/ProductDetails';
import RateUsScreen from './screens/RateUs';
import GalleryScreen from './screens/Gallery';
import GalleryDetailsScreen from './screens/GalleryDetails';
import GiftVouchersScreen from './screens/GiftVouchers';
import CartScreen from './screens/Cart';
import CSOSaleConfirmListScreen from './screens/CSOSaleConfrimList';
import EConnectScreen from './screens/EConnect';
import ChangePasswordScreen from './screens/ChangePassword';
import InfluencerListScreen from './screens/InfluencerList';
import MemberDetailsScreen from './screens/MemberDetails';
import MemberListScreen from './screens/MemberList';
import MemberListOptionScreen from './screens/MemberListOption';
import MyLeadScreen from './screens/MyLeads';
import MyOrderScreen from './screens/MyOrder';
import NewEnrollmentScreen from './screens/NewEnrollment';
import PanUploadScreen from './screens/PanUpload';
import PointStatementScreen from './screens/PointStatement';
import ProfileScreen from './screens/Profile';
import RegisterLiftingScreen from './screens/RegisterLifting';
import RegisterLeadScreen from './screens/RegisterLeads';
import SaleHistoryScreen from './screens/SaleHistory';
import UpdateKYCScreen from './screens/UpdateEKYC';
import ProfileDetailsScreen from './screens/ProfileDetails';
import OrderDetailsScreen from './screens/OrderDetails';
import ConstructionCalculatorScreen from './screens/ConstructionCalculator';
import ApproveLeadScreen from './screens/ApproveLead';
import LeadDetailsScreen from './screens/LeadDetails';
import PortfolioScreen from './screens/Portfolio';
import PortfolioDetailsScreen from './screens/PortfolioDetails';
import From16ListScreen from './screens/From16List';
import LanguageScreen from './screens/Language';
import DeliveryConfirmationScreen from './screens/DeliveryConfirmation';
import AddreessScreen from './screens/Address';
import PendingApprovalScreen from './screens/PendingApproval';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {

  useEffect(() => {
    LogBox.ignoreLogs([
      'Animated: `useNativeDriver`',
      'Sending `onAnimatedValueUpdate` with no listeners registered.',
      'new NativeEventEmitter()'
    ]);
    LogBox.ignoreAllLogs();
  }, [])

  function MyStack() {
    return (
      <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Rewards" component={RewardScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="RateUs" component={RateUsScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="GalleryDetails" component={GalleryDetailsScreen} />
        <Stack.Screen name="GiftVouchers" component={GiftVouchersScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="CSOSaleConfirmList" component={CSOSaleConfirmListScreen} />
        <Stack.Screen name="EConnect" component={EConnectScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="InfluencerList" component={InfluencerListScreen} />
        <Stack.Screen name="MemberDetails" component={MemberDetailsScreen} />
        <Stack.Screen name="MemberList" component={MemberListScreen} />
        <Stack.Screen name="MemberListOption" component={MemberListOptionScreen} />
        <Stack.Screen name="MyLeads" component={MyLeadScreen} />
        <Stack.Screen name="MyOrders" component={MyOrderScreen} />
        <Stack.Screen name="NewEnrollment" component={NewEnrollmentScreen} />
        <Stack.Screen name="PanUpload" component={PanUploadScreen} />
        <Stack.Screen name="PointStatement" component={PointStatementScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="RegisterLifting" component={RegisterLiftingScreen} />
        <Stack.Screen name="RegisterLeads" component={RegisterLeadScreen} />
        <Stack.Screen name="SalesHistory" component={SaleHistoryScreen} />
        <Stack.Screen name="UpdateKYC" component={UpdateKYCScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="ConstructionCalculator" component={ConstructionCalculatorScreen} />
        <Stack.Screen name="ApproveLead" component={ApproveLeadScreen} />
        <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
        <Stack.Screen name="Portfolio" component={PortfolioScreen} />
        <Stack.Screen name="PortfolioDetails" component={PortfolioDetailsScreen} />
        <Stack.Screen name="From16List" component={From16ListScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
        <Stack.Screen name="Address" component={AddreessScreen} />
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* <MyStack /> */}
        <Drawer.Navigator drawerContent={(props) => <LeftMenuBarScreen {...props} />}>
          <Drawer.Screen name="Welcome" options={{ headerShown: false, swipeEnabled: true }} component={MyStack} />
        </Drawer.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;

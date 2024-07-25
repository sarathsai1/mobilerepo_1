import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import WelcomeBackHeader from "./components/WelcomeBackHeader";
import DashboardStats from "./components/DashboardStats";
import MenuOptions from "./components/MenuOptions";
import useTabletStyle from "../../styles/TabStyles";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from '../../navigation/types'; // Adjust based on your project structure
import LoadingScreen from '../../navigation/Loading'; // Import the LoadingScreen component
import Loading from "../../navigation/Loading";

// Define navigation prop type
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { isTablet, orientation } = useTabletStyle();
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const api_url = 'http://54.152.49.191:8080/dashboard';
                const response = await axios.get(api_url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setStatusCode(response.data.statusCode);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
                setStatusCode(null);  // Explicitly handle the error case
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (statusCode !== null) {
            switch (statusCode) {
                case 200:
                    // Stay on HomeScreen
                    break;
                case 404:
                    navigation.navigate('Approval');
                    break;
                case 400:
                    navigation.navigate('Registration');
                    break;
                case 420:
                    navigation.navigate('Subscription');
                    break;
                case 207:
                    navigation.navigate('EmplyeeDashboard');
                    break;
                default:
                    console.warn(`Unhandled status code: ${statusCode}`);
                    break;
            }
        }
    }, [statusCode, navigation]);

    // Show loading screen while fetching data
    if (loading) {
        return <Loading />;
    }

    // If statusCode is not 200, render nothing (or handle it accordingly)
    if (statusCode !== 200) {
        return null; // Render nothing or handle this scenario as required
    }

    const menuItems = [
        { id: '1', title: "Projects", navigation: 'Projects' },
        { id: '2', title: "Employee's", navigation: 'Employees' },
        { id: '3', title: "Client's", navigation: 'Clients' },
        { id: '4', title: "Payment Pending's", navigation: 'ClientsDues' },
        { id: '5', title: "Setting's", navigation: 'Settings' },
    ];

    function handleMenuItemPress(navigationTarget: string): void {
        navigation.navigate(navigationTarget as keyof RootStackParamList); // Type assertion for navigation target
    }

    return (
        <>
            {isTablet && orientation === 'horizontal' ? (
                <View style={styles.container}>
                    <View style={styles.dashboarHeadingContent}>
                        <WelcomeBackHeader userName="Jordan Eagle" />
                    </View>

                    <View style={[styles.dashboarMenuListContent, { flexDirection: 'row' }]}>
                        <View style={{ width: '40%', paddingRight: 10 }}>
                            <DashboardStats />
                        </View>

                        <View style={{ width: '60%', paddingLeft: 10 }}>
                            <FlatList
                                data={menuItems}
                                renderItem={({ item }) => (
                                    <MenuOptions title={item.title} onPress={() => handleMenuItemPress(item.navigation)} />
                                )}
                                keyExtractor={(item) => item.id}
                            />
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.container}>
                    <View style={styles.dashboarHeadingContent}>
                        <WelcomeBackHeader userName="Jordan Eagle" />
                        <DashboardStats />
                    </View>

                    <View style={styles.dashboarMenuListContent}>
                        <FlatList
                            data={menuItems}
                            renderItem={({ item }) => (
                                <MenuOptions title={item.title} onPress={() => handleMenuItemPress(item.navigation)} />
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D7E5D5',
    },
    dashboarHeadingContent: {
        marginHorizontal: 18,
    },
    dashboarMenuListContent: {
        paddingTop: 15,
        paddingHorizontal: 18,
        backgroundColor: 'white',
        height: '100%',
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
    },
});

export default HomeScreen;

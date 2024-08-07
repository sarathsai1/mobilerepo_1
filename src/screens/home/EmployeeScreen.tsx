import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import EmployeeBackHeader from "./components/EmployeeDashBoard/EmployeeBackHeader";
import EmployeeHome from "./components/EmployeeDashBoard/EmployeeHome";
import useTabletStyle from "../../styles/TabStyles";
import { RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { isTablet, orientation } = useTabletStyle();
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch data or perform other side effects here
        // Simulate data fetching
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={[styles.container, isTablet ? styles.tabletContainer : styles.mobileContainer]}>
            
            <View style={styles.dashboarHeadingContent}>
                <EmployeeBackHeader userName="Jordan Eagle" />
                <ScrollView showsVerticalScrollIndicator={true} style={{ width: '100%', height: 400 }}>
                <EmployeeHome />
                </ScrollView>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        
        flex: 1,
        backgroundColor: '#D7E5D5',
    },
    tabletContainer: {
        paddingHorizontal: 10,
       
    },
    mobileContainer: {
        width:'100%',
        paddingHorizontal: 1,
    },
    dashboarHeadingContent: {

        flex: 1,
        paddingVertical: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../../../../theme";
import AssigmentContent from "./components/AssigmentContent";
import NewRequestsAssistant from "./components/NewRequestsAssistant";
import { useNavigation } from '@react-navigation/native';

interface AllocationProps {}

const Allocation: React.FC<AllocationProps> = () => {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pocNames, setPocNames] = useState<any[]>([]);
    const [assistantNames, setAssistantNames] = useState<any[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const storedId = await AsyncStorage.getItem('projectId');
                const token = await AsyncStorage.getItem('authToken');
                console.log('Retrieved projectId:', storedId);
                console.log('Retrieved authToken:', token);
                
                if (storedId !== null && token !== null) {
                    const id = JSON.parse(storedId);
                    const response = await fetch(`http://54.152.49.191:8080/project/${id}/details`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    console.log('API response status:', response.status);
                    if (response.ok) {
                        const data = await response.json();
                        setProject(data);

                        // Parse roles from the response and set POC and Assistant names
                        const roles = data.roles;
                        const pocNames = roles
                            .filter((role: { roleId: number; }) => role.roleId === 1)
                            .map((role: { employeeFirstName: string; roleName: string; }) => ({
                                name: `${role.employeeFirstName} `,
                                status: 'pending', // Assuming all are accepted for now
                                roleName: role.roleName,
                            }));
                        const assistantNames = roles
                            .filter((role: { roleId: number; }) => role.roleId === 3)
                            .map((role: { employeeFirstName: string; roleName: string; }) => ({
                                name: `${role.employeeFirstName} `,
                                status: 'accepted', // Assuming all are accepted for now
                                roleName: role.roleName,
                            }));

                        setPocNames(pocNames);
                        setAssistantNames(assistantNames);
                    } else {
                        setError('Failed to fetch project details');
                    }
                } else {
                    setError('Project ID or Token not found');
                }
            } catch (error) {
                console.error('Error retrieving project details:', error);
                setError('Error retrieving project details');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.cardContent}>
            <View style={styles.headerContainer}>
                <Text style={styles.nameText}>Allocation</Text>
                <TouchableOpacity 
                    onPress={() => { 
                        if (project && project.id) {
                            // navigation.navigate(" ");
                        }
                    }}
                >
                    <Image
                        source={require('../../../../../assets/icons/edit.png')}
                        style={{ width: 30, height: 30 }}
                    />
                </TouchableOpacity>
            </View>

            <AssigmentContent PocNames={pocNames} AssistantNames={assistantNames} />

            <View style={styles.divideLine}></View>

            <NewRequestsAssistant />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContent: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 25,
        marginVertical: 10,
        position: 'relative',
        padding: 20,
    },

    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    divideLine: {
        height: 2,
        backgroundColor: '#D8D9DD',
        marginVertical: 10,
        marginHorizontal: 25,
    },
});

export default Allocation;

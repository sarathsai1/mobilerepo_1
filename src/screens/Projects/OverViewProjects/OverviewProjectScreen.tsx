import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import BackGround from '../../../components/BackGround';
import defaults from '../../../styles/defaults';
import RoundButton from '../../../components/buttons/RoundButton';
import { theme } from '../../../theme';
import StatusIndicator from '../ProjectsList/Components/StatusIndicator';
import Allocation from './Components/Allocation/Allocation';
import SendNotification from './Components/SendNotification';
import Fees from './Components/Fees/Fees';
import Remarks from './Components/Remarks/Remarks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

interface Project {
    name: string;
    status: string;
    estimatedStartDate: string;
    estimatedEndDate: string;
    natureOfWork: string;
}

const OverviewProjectScreen: React.FC = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false); // State to trigger refresh
    const navigation = useNavigation();

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
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

                console.log(response);
                console.log('API response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setProject(data);
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

    useEffect(() => {
        fetchProjectDetails();
    }, [refresh]); // Fetch project details when refresh state changes

    const openModal = () => {
        console.log('openModal');
        // Implement modal opening logic here
        // After the modal closes and an update occurs, trigger a refresh
        setRefresh(prev => !prev); // Toggle refresh state
    };

    if (loading) return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loading} />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <BackGround safeArea={true} style={defaults.flex}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.topContentBtns}>
                        <View>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Image
                                    source={require('../../../assets/icons/back.png')} // Replace with your actual back icon path
                                    style={{ width: 40, height: 40 }} // Add style as needed
                                />
                            </TouchableOpacity>
                        </View>
                        <View></View>
                        <View>
                            <RoundButton
                                title={'Edit project'}
                                onPress={openModal}
                                style={styles.addClientWidthButton}
                            />
                        </View>
                    </View>

                    <View style={styles.overviewContent}>
                        {project && (
                            <View style={styles.cardContent}>
                                <View style={styles.cardTextContent}>
                                    <View style={styles.headingText}>
                                        <View>
                                            <Text style={styles.nameText}>{project.name}</Text>
                                            <Text style={styles.workText}>
                                                Income Tax <Text style={styles.workTitleText}>{project.natureOfWork}</Text>
                                            </Text>
                                        </View>
                                        <View style={styles.statusContent}>
                                            <Text style={styles.statusNameText}>Status</Text>
                                            <StatusIndicator status={project.status || 'Not Started'} />
                                        </View>
                                    </View>

                                    <View style={styles.datesTextContent}>
                                        <Text style={styles.dateTextTitle}>
                                            Start Date: <Text style={styles.dateText}>{project.estimatedStartDate}</Text>
                                        </Text>
                                        <Text style={styles.dateTextTitle}>
                                            ETC: <Text style={styles.dateText}>{project.estimatedEndDate}</Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <Allocation />
                        <SendNotification />
                        <Fees />
                        <Remarks />
                    </View>
                </ScrollView>
            </View>
        </BackGround>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContentBtns: {
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addClientWidthButton: {
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 25,
    },
    overviewContent: {},
    cardContent: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 25,
        marginVertical: 10,
        padding: 20,
    },
    cardTextContent: {},
    headingText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datesTextContent: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    statusNameText: {
        fontSize: 24,
        marginRight: 10,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    workText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    workTitleText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
    },
    dateTextTitle: {
        color: theme.colors.text,
    },
    dateText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default OverviewProjectScreen;

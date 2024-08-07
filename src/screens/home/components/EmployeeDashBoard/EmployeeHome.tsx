import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackGround from "../../../../components/BackGround";
import RoundButton from "../../../../components/buttons/RoundButton";
import ProjectsCards from "../../../Projects/ProjectsList/Components/ProjectsCards";
import SortByModal from "../../../Projects/ProjectsList/Components/SortByModal";
import useTabletStyle from "../../../../styles/TabStyles";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../../../theme";

const EmployeeHome: React.FC = () => {
    const navigation = useNavigation<any>();
    const [isModalVisible, setModalVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortmodalVisible, setSortModalVisible] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState('');
    const [projectsData, setProjectsData] = useState<any[]>([]);
    const [approvalRequestsCount, setApprovalRequestsCount] = useState(0);
    const { isTablet, orientation } = useTabletStyle();

    const sortOptions = [
        { name: 'Due Date', value: 'dueDate' },
        { name: 'Status Changes', value: 'statusChanges' },
        { name: 'Not Yet Started (Red)', value: 'notStarted' },
        { name: 'In Progress (Orange)', value: 'inProgress' },
        { name: 'Completed (Green)', value: 'completed' },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const professionalId = await AsyncStorage.getItem('Id');

                if (!token || !professionalId) {
                    throw new Error("Token or professionalId is missing");
                }

                const response = await fetch(`http://54.152.49.191:8080/project/getAllProjects/${professionalId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setProjectsData(data);
                } else {
                    throw new Error('Unexpected data structure');
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError('Failed to fetch projects');
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchApprovalRequestsCount = async () => {
            try {
                const count = await getApprovalRequestsFromAPI();
                setApprovalRequestsCount(count);
            } catch (err) {
                console.error("Error fetching approval requests count:", err);
            }
        };

        fetchApprovalRequestsCount();
    }, []);

    const handleOptionSelect = (value: string) => {
        setSelectedSortOption(value);
        setSortModalVisible(false);
    };

    const handleApprovalRequestsView = () => {
        navigation.navigate('ApprovalProjects');
    };

    const handleFormSubmit = (formData: any) => {
        console.log('Form Data:', formData);
        // Process formData here
    };

    const getApprovalRequestsFromAPI = async (): Promise<number> => {
        // Replace with your actual API call
        return new Promise((resolve) => setTimeout(() => resolve(2), 1000));
    };

    return (
        <BackGround safeArea={true} style={styles.container}>
            <View style={styles.topContentBtns}>
                <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.sortByButton}>
                    <Text style={styles.buttonText}>Sort By</Text>
                    <Image
                        source={require('../../../../assets/icons/down_arrow_block.png')}
                        style={styles.arrowIcon}
                    />
                </TouchableOpacity>

                <RoundButton
                    title={'+ Request'}
                    onPress={() => setModalVisible(true)}
                    style={styles.addClientsWidthButton}
                />
            </View>

            <View style={styles.approvalRequestsContainer}>
                <RoundButton
                    title={'Project Approval Requests'}
                    onPress={handleApprovalRequestsView}
                    
                />
                {approvalRequestsCount > 0 && (
                    <View style={styles.notificationBubble}>
                        <Text style={styles.notificationText}>{approvalRequestsCount}</Text>
                    </View>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={isTablet && orientation === 'horizontal' ? styles.tabletLayout : styles.projectList}>
                    {projectsData.map((project) => (
                        <View key={project.id} style={isTablet && orientation === 'horizontal' ? styles.tabletCard : styles.projectCard}>
                            <ProjectsCards
                                message={project.message || 'Prasad(POC) has recently modified!'}
                                clientName={project.name || ''}
                                workNature={project.natureOfWork || ''}
                                statusMesg={project.projectStatus || ''}
                                startDate={project.estimatedStartDate || ''}
                                etcDate={project.estimatedEndDate || ''}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* <UniversalFormModal visible={isModalVisible} onClose={() => setModalVisible(false)} titleName={'Add Project'}>
                <AddProjectsForm onSubmit={handleFormSubmit} />
            </UniversalFormModal> */}

            <SortByModal
                visible={sortmodalVisible}
                onClose={() => setSortModalVisible(false)}
                options={sortOptions}
                onOptionSelect={handleOptionSelect}
            />
        </BackGround>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D7E5D5',
    },
    topContentBtns: {
        marginVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sortByButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        padding: 15,
        borderRadius: 25,
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
        marginRight: 10,
    },
    arrowIcon: {
        width: 18,
        height: 10,
    },
    addClientsWidthButton: {
        alignSelf: 'center',
        paddingHorizontal: 25,
    },
    approvalRequestsContainer: {
        paddingBottom: 10,
        position: 'relative',
    },
    notificationBubble: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationText: {
        color: 'white',
        fontWeight: 'bold',
    },
    tabletLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    projectList: {
        flexDirection: 'column',
    },
    projectCard: {
        marginBottom: 20,
    },
    tabletCard: {
        width: '48%',
        marginVertical: 10,
    },
});

export default EmployeeHome;

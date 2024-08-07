import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import RoundInput from '../../../../components/inputs/RoundInput';
import RoundButton from '../../../../components/buttons/RoundButton';
import RoundPicker from '../../../../components/inputs/RoundPicker';
import MultiSelectDropDown from '../../../../components/inputs/MultiSelectDropDown';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FormData = {
    clientId: number;
    natureOfWork: string;
    name: string;
    estimatedStartDate: string;
    estimatedEndDate: string;
    totalProjectAmont: number;
    amountPaid: number;
    roles: { roleId: number; employeeIds: number[] }[];
};

const AddProjectsForm = ({ onSubmit }: { onSubmit: (formData: FormData) => void }) => {
    const [formData, setFormData] = useState<FormData>({
        clientId: 0,
        natureOfWork: '',
        name: '',
        estimatedStartDate: moment().format('YYYY-MM-DD'),
        estimatedEndDate: moment().format('YYYY-MM-DD'),
        totalProjectAmont: 0,
        amountPaid: 0,
        roles: [
            { roleId: 1, employeeIds: [] }, // POC role
            { roleId: 3, employeeIds: [] }  // Assistant role
        ]
    });
    const [modalVisible, setModalVisible] = useState<'start' | 'end' | null>(null);
    const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number } | null>(null);
    const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [professionalId, setProfessionalId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedClient, setSelectedClient] = useState<number>(0);

    useEffect(() => {
        const getID = async () => {
            try {
                const storedId = await AsyncStorage.getItem('Id');
                if (storedId !== null) {
                    setProfessionalId(JSON.parse(storedId));
                }
            } catch (error) {
                console.error('Error retrieving item from AsyncStorage:', error);
            }
        };

        getID();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            if (professionalId === null) return;

            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) throw new Error('Token not found');

                const response = await axios.get(`http://54.152.49.191:8080/client/getAllClientNames/${professionalId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const clientsData = response.data.map((client: { id: number; name: string }) => ({
                    id: client.id,
                    name: client.name,
                }));
                setClients(clientsData);

            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };

        fetchClients();
    }, [professionalId]);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (professionalId === null) return;

            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) throw new Error('Token not found');

                const response = await axios.get(`http://54.152.49.191:8080/employee/getEmployeeListBy/${professionalId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setEmployees(response.data); // Adjust according to the API response format
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployees();
    }, [professionalId]);

    const handleChange = (name: keyof FormData, value: any) => {
        let updatedFormData = { ...formData, [name]: value };

        if (name === 'clientId') {
            const selectedClient = clients.find(client => client.id === value);
            if (selectedClient) {
                updatedFormData = { ...updatedFormData, name: selectedClient.name };
            }
        }

        setFormData(updatedFormData);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        // Add validation logic here
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) throw new Error('Token not found');

                const requestBody = {
                    id: 0,
                    name: formData.name,
                    natureOfWork: formData.natureOfWork,
                    estimatedStartDate: formData.estimatedStartDate,
                    estimatedEndDate: formData.estimatedEndDate,
                    professionalId: professionalId || 0,
                    clientId: formData.clientId || 0,
                    totalProjectAmont: Number(formData.totalProjectAmont),
                    amountPaid: Number(formData.amountPaid),
                    roles: formData.roles.map(role => ({
                        roleId: role.roleId,
                        employeeIds: role.employeeIds.map(id => Number(id))

                    }))

                };
                console.log('Request body:', JSON.stringify(requestBody, null, 2));

                // Log the request body to debug
                console.log('Submitting request:', requestBody);

                const response = await axios.post('http://54.152.49.191:8080/project/save', JSON.stringify(requestBody), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                // Log the response to debug
                console.log('API response:', response.data);
                await AsyncStorage.setItem('projectId', JSON.stringify(response.data.id));
console.log('ddd',response.data.id);
                // Reset form data after successful submission
                setFormData({
                    clientId: 0,
                    natureOfWork: '',
                    name: '',
                    estimatedStartDate: moment().format('YYYY-MM-DD'),
                    estimatedEndDate: moment().format('YYYY-MM-DD'),
                    totalProjectAmont: 0,
                    amountPaid: 0,
                    roles: [
                        { roleId: 1, employeeIds: [] },
                        { roleId: 3, employeeIds: [] }
                    ],
                });

                console.log('Form submitted successfully');
            } catch (error) {
        
    }
        }
    };

    const onDayPress = (date: { dateString: string }) => {
        if (modalVisible === 'start') {
            handleChange('estimatedStartDate', date.dateString);
        } else if (modalVisible === 'end') {
            handleChange('estimatedEndDate', date.dateString);
        }
        setModalVisible(null);
    };

    const handleInputPress = (event: any, type: 'start' | 'end') => {
        const { pageY } = event.nativeEvent;
        setModalVisible(type);
        setCalendarPosition({ top: pageY - 300, left: 20 });
    };

    const markedDates = {
        [formData.estimatedStartDate]: { selected: true, selectedColor: 'green' },
        [formData.estimatedEndDate]: { selected: true, selectedColor: 'green' },
    };

    // const handleRoleSelection = (roleId: number, selectedItems: string[]) => {
    //     const selectedEmployeeIds = selectedItems.map(name => {
    //         const employee = employees.find(emp => emp.name === name);
    //         return employee ? employee.id : null;
    //     }).filter(id => id !== null) as number[];

    //     setFormData(prevFormData => ({
    //         ...prevFormData,
    //         roles: prevFormData.roles.map(role => role.roleId === roleId ? { ...role, employeeIds: selectedEmployeeIds } : role)
    //     }));
    // };
    // const handleRoleSelection = (roleId: number, selectedItems: string[]) => {
    //     console.log('Selected items:', selectedItems);

        // // Convert selectedItems from string[] to { id: number, name: string }[]
        // const handleRoleSelection = (roleId: number, selectedItems: string[]) => {
        //     console.log('Selected items:', selectedItems);

        //     // Convert selectedItems from string[] to { id: number, name: string }[]
        //     const selectedEmployeeDetails = selectedItems.map(idStr => {
        //         const id = Number(idStr); // Convert string to number
        //         const employee = employees.find(emp => emp.id === id);
        //         return employee ? { id: employee.id, name: employee.name } : null;
        //     }).filter((detail): detail is { id: number, name: string } => detail !== null);

        //     // Extract only the ids from selectedEmployeeDetails
        //     const selectedEmployeeIds = selectedEmployeeDetails.map(detail => detail.id);

        //     console.log('Selected employee details:', selectedEmployeeDetails);

        //     setFormData(prevFormData => ({
        //         ...prevFormData,
        //         roles: prevFormData.roles.map(role =>
        //             role.roleId === roleId
        //                 ? { ...role, employeeIds: selectedEmployeeIds }
        //                 : role
        //         )
        //     }));
        // };


        const handleRoleSelection = (roleId: number, selectedItems: string[]) => {
            console.log('Selected items:', selectedItems);
        
            // Convert selectedItems from string[] to { id: number, name: string }[]
            const selectedEmployeeDetails = selectedItems.map(idStr => {
                const id = Number(idStr); // Convert string to number
                const employee = employees.find(emp => emp.id === id);
                return employee ? { id: employee.id, name: employee.name } : null;
            }).filter((detail): detail is { id: number, name: string } => detail !== null);
        
            // Extract only the ids from selectedEmployeeDetails
            const selectedEmployeeIds = selectedEmployeeDetails.map(detail => detail.id);
        
            console.log('Selected employee details:', selectedEmployeeDetails);
        
            setFormData(prevFormData => ({
                ...prevFormData,
                roles: prevFormData.roles.map(role => 
                    role.roleId === roleId 
                        ? { ...role, employeeIds: selectedEmployeeIds }
                        : role
                )
            }));
        };
        


        const handleValueChange = (itemValue: string | number, _itemIndex: number) => {
            if (typeof itemValue === 'number') {
                setSelectedClient(itemValue);
                handleChange('clientId', itemValue);
            }
        };

        return (
            <View style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', height: 400 }}>
                    <Text style={styles.label}>Client Name</Text>
                    <View style={styles.dropdownContainer}>
                        <RoundPicker
                            label="Select Client"
                            selectedValue={selectedClient}
                            onValueChange={handleValueChange}
                            items={clients.map(client => ({ label: client.name, value: client.id }))}
                            placeholder="Select a client"
                        />
                        {errors.clientId && <Text style={styles.errorText}>{errors.clientId}</Text>}
                    </View>

                    <Text style={styles.label}>Work Nature</Text>
                    <RoundInput
                        placeholder="Work Nature"
                        value={formData.natureOfWork}
                        onChangeText={(value) => handleChange('natureOfWork', value)}
                        label=""
                        editable={true}
                        error={errors.natureOfWork} options={[]} />

                    <TouchableOpacity onPress={(event) => handleInputPress(event, 'start')}>
                        <RoundInput
                            style={styles.dateInput}
                            placeholder="Estimated Start Date"
                            value={moment(formData.estimatedStartDate).format('DD/MM/YYYY')}
                            label="Estimated Start Date"
                            editable={false}
                            error={errors.estimatedStartDate}
                            onChangeText={() => { }} options={[]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={(event) => handleInputPress(event, 'end')}>
                        <RoundInput
                            style={styles.dateInput}
                            placeholder="Estimated End Date"
                            value={moment(formData.estimatedEndDate).format('DD/MM/YYYY')}
                            label="Estimated End Date"
                            editable={false}
                            error={errors.estimatedEndDate}
                            onChangeText={() => { }} options={[]} />
                    </TouchableOpacity>

                    <MultiSelectDropDown
                        placeholder='POC'
                        data={employees.map(emp => ({ label: emp.name, value: emp.id.toString() }))}
                        label={'POC'}
                        onSelectionChange={(selectedItems: string[]) => {
                            handleRoleSelection(1, selectedItems);
                        }}
                        selectedItems={formData.roles.find(role => role.roleId === 1)?.employeeIds.map(id => id.toString()) || []}
                    />

                    <MultiSelectDropDown
                        placeholder='Assistant'
                        data={employees.map(emp => ({ label: emp.name, value: emp.id.toString() }))}
                        label={'Assistant'}
                        onSelectionChange={(selectedItems: string[]) => {
                            handleRoleSelection(3, selectedItems);
                        }}
                        selectedItems={formData.roles.find(role => role.roleId === 3)?.employeeIds.map(id => id.toString()) || []}
                    />


                    <Text style={styles.label}>Total Project Amount</Text>
                    <RoundInput
                        placeholder="Total Project Amount"
                        value={formData.totalProjectAmont.toString()}
                        onChangeText={(value) => handleChange('totalProjectAmont', Number(value) || 0)}
                        label=""
                        editable={true}
                        keyboardType="numeric"
                        error={errors.totalProjectAmont} options={[]} />

                    <Text style={styles.label}>Amount Paid</Text>
                    <RoundInput
                        placeholder="Amount Paid"
                        value={formData.amountPaid.toString()}
                        onChangeText={(value) => handleChange('amountPaid', Number(value) || 0)}
                        label=""
                        editable={true}
                        keyboardType="numeric"
                        error={errors.amountPaid} options={[]} />

                    <RoundButton
                        title="Add Project"
                        onPress={handleSubmit}
                    />

                    <Modal
                        visible={modalVisible !== null}
                        transparent={true}
                        animationType="none"
                        onRequestClose={() => setModalVisible(null)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, calendarPosition]}>
                                <Calendar
                                    onDayPress={onDayPress}
                                    markedDates={markedDates}
                                />
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>
        );
    };

    const styles = StyleSheet.create({
        formContainer: {
            width: '100%',
        },
        dateInput: {
            flex: 1,
            marginHorizontal: 2,
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        dropdownContainer: {
            marginBottom: 16,
        },
        errorText: {
            color: 'red',
            marginTop: 4,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
        },
    });

    export default AddProjectsForm;

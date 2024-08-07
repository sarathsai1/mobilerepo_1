import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RoundPicker from "./RoundPicker";

type Option = {
    label: string; // Display name
    value: string; // ID
};

type MultiSelectDropDownProps = {
    data: Option[]; // Array of options with label and value
    label: string; // Placeholder label for the picker
    selectedItems: string[];
    onSelectionChange: (selectedItems: string[]) => void; // Callback to update selected items
    placeholder?: string;
    // items: { label: string; value: number }[];
    // onSelect: (selectedItems: number[]) => void;
};

type TagProps = {
    item: string; // Selected item label
    onRemove: (item: string) => void; // Callback to remove item
};

const Tag: React.FC<TagProps> = ({ item, onRemove }) => {
    return (
        <View style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => onRemove(item)}>
                <Image
                    source={require('../../assets/icons/close_remove.png')}
                    style={styles.tagClose}
                />
            </TouchableOpacity>
        </View>
    );
};

const MultiSelectDropDown: React.FC<MultiSelectDropDownProps> = ({
    data = [], // Default to an empty array
    label,
    selectedItems = [], // Default to an empty array
    onSelectionChange,
    placeholder,
}) => {
    const [selectedValue, setSelectedValue] = useState<string>('');

    // Ensure data is an array
    if (!Array.isArray(data)) {
        console.error('Data prop should be an array');
        return null;
    }

    // Create a map from IDs to names for quick lookup
    const idToNameMap = data.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
    }, {} as Record<string, string>);

    // Handle the change of selected value from the picker
    const handleValueChange = (itemValue: string | number) => {
        if (itemValue !== '') {
            handleSelectItem(itemValue.toString());
            setSelectedValue(''); // Reset the picker value
        }
    };

    // Add selected item if it's not already included
    const handleSelectItem = (itemValue: string) => {
        if (!selectedItems.includes(itemValue)) {
            const updatedSelectedItems = [...selectedItems, itemValue];
            onSelectionChange(updatedSelectedItems);
        }
    };

    // Remove the selected item
    const removeTag = (itemValue: string) => {
        const updatedSelectedItems = selectedItems.filter((selectedItem) => selectedItem !== itemValue);
        onSelectionChange(updatedSelectedItems);
    };

    // Filter out selected items from the dropdown data
    const filteredData = data.filter(item => !selectedItems.includes(item.value));

    // Get the label for a given ID
    const getLabelForValue = (value: string) => {
        return idToNameMap[value] || '';
    };

    return (
        <View style={styles.container}>
            <RoundPicker
                selectedValue={selectedValue}
                items={filteredData} // Use filtered data here
                placeholder={placeholder} // Your placeholder text
                onValueChange={handleValueChange}
            />
            <View style={styles.selectedTagsContent}>
                {selectedItems.map((itemValue) => (
                    <Tag key={itemValue} item={getLabelForValue(itemValue)} onRemove={removeTag} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        borderRadius: 25,
        borderColor: '#D0D5DD',
        backgroundColor: '#F0F1F5',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 1,
    },
    selectedTagsContent: {
        padding: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 20,
        padding: 10,
        marginRight: 5,
        marginBottom: 5,
        alignItems: 'center',
    },
    tagText: {
        color: 'white',
    },
    tagClose: {
        width: 20,
        height: 20,
        marginLeft: 5,
    },
});

export default MultiSelectDropDown;

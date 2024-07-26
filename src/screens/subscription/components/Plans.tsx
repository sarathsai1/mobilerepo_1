import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../../theme';

type SubscriptionPlansType = {
  id: string;
  name: string;
  subscriptionDuration: number;
  subscriptionPlanAmount: number;
  description: string[];
};

type SubscriptionPlansProps = {
  options: SubscriptionPlansType[];
  onSelectionChange: (selectedOption: SubscriptionPlansType) => void;
};

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ options, onSelectionChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelection = (selectedOption: SubscriptionPlansType) => {
    setSelectedId(selectedOption.id);
    onSelectionChange(selectedOption);
  };

  return (
    <ScrollView>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.container,
            option.id === selectedId && styles.selectedContainer
          ]}
          onPress={() => handleSelection(option)}
        >
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{option.name}</Text>
            <Text style={[styles.priceText, { marginBottom: 10 }]}>
              ₹{option.subscriptionPlanAmount} / mo (₹{option.subscriptionDuration} / year)
            </Text>
            <Text style={[styles.priceText, { fontWeight: '600' }]}>{option.description}</Text>
          </View>
          <View style={styles.radioButton}>
            <View
              style={[
                styles.radioButtonIndicator,
                option.id === selectedId && styles.radioButtonSelected,
              ]}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: theme.colors.text,
    backgroundColor: 'white',
  },
  selectedContainer: {
    borderColor: 'green',
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  priceText: {
    color: 'black',
    fontSize: 16,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonIndicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  radioButtonSelected: {
    backgroundColor: 'green',
    height: 12,
    width: 12,
    borderRadius: 6,
  },
});

export default SubscriptionPlans;

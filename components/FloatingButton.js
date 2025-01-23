import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FloatingButton = ({
  onPress,
  iconName = 'add',
  iconColor = '#fff',
  backgroundColor = '#6200ee',
  position = 'bottom-right', 
  top,
  bottom = 16,
  left,
  right = 16,
}) => {
  // Calcula estilos dinámicos según la posición
  const getPositionStyles = () => {
    const styles = {};
    if (position === 'top-left') {
      styles.top = top ?? 16;
      styles.left = left ?? 16;
    } else if (position === 'top-right') {
      styles.top = top ?? 16;
      styles.right = right ?? 16;
    } else if (position === 'bottom-left') {
      styles.bottom = bottom ?? 16;
      styles.left = left ?? 16;
    } else {
      // Default: bottom-right
      styles.bottom = bottom ?? 16;
      styles.right = right ?? 16;
    }
    return styles;
  };

  return (
    <View style={[styles.container, getPositionStyles()]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Icon name={iconName} size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default FloatingButton;
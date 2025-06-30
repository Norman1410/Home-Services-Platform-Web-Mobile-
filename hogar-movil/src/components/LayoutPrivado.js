// components/LayoutPrivado.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from './Navbar';

export default function LayoutPrivado({ children }) {
  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
});

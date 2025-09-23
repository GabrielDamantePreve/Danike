import { StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import React, { forwardRef } from 'react';

type Props = {
    imgSource: ImageSource;
    selectedImage?: string;
};

const ImageViewer = forwardRef<View, Props>(({ imgSource, selectedImage }, ref) => {
    const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

    return (
        <View ref={ref as any} style={styles.container}>
            <Image source={imageSource} style={styles.image} />
        </View>
    );
});

export default ImageViewer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 320,
        height: 440,
        borderRadius: 18,
    },
});
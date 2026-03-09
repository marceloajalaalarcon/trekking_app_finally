import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isLoggedIn } from '../services/api';

export default function Index() {
    const [checked, setChecked] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        isLoggedIn().then(val => {
            setLoggedIn(val);
            setChecked(true);
        });
    }, []);

    if (!checked) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
    if (loggedIn) return <Redirect href="/(tabs)" />;
    return <Redirect href="/auth/login" />;
}

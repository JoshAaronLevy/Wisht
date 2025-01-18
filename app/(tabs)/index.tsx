import 'react-native-get-random-values';
import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import parseCredentials from '../../environments/keys';
import NewWishlistModal from '@/components/NewWishlistModal';

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(parseCredentials.appId, parseCredentials.jsKey);
Parse.serverURL = parseCredentials.serverUrl;

interface FormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
});

const App: React.FC = () => {
  const [isLoginTab, setIsLoginTab] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<Parse.User<Parse.Attributes> | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const user = await Parse.User.currentAsync();
        setCurrentUser(user || null);
      } catch (err) {
        console.warn('Failed to fetch current user:', err);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const showToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    message?: string
  ) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
    });
  };

  const handleFormSubmit = async (values: FormValues) => {
    const { email, password } = values;

    if (isLoginTab) {
      try {
        await Parse.User.logIn(email, password);
        showToast('success', 'Login successful!', `Welcome, ${email}!`);

        // Delay setting currentUser so the toast is visible for ~2s
        const user = Parse.User.current();
        setTimeout(() => {
          setCurrentUser(user || null);
        }, 2000);
      } catch (err: any) {
        // If user not found => code 101 => try SIGNUP
        if (err?.code === 101) {
          try {
            const newUser = new Parse.User();
            newUser.set('username', email);
            newUser.set('password', password);
            newUser.set('email', email);

            await newUser.signUp();
            showToast(
              'success',
              'Account created!',
              'User did not exist, so we created a new account. You are now logged in!'
            );

            // Delay for toast
            const user = Parse.User.current();
            setTimeout(() => {
              setCurrentUser(user || null);
            }, 2000);
          } catch (signupErr: any) {
            showToast(
              'error',
              'Sign Up after failed login also failed',
              signupErr?.message ?? 'Unknown error'
            );
          }
        } else {
          showToast('error', 'Login failed', err?.message ?? 'Unknown error');
        }
      }
    } else {
      // Try SIGNUP
      try {
        const newUser = new Parse.User();
        newUser.set('username', email);
        newUser.set('password', password);
        newUser.set('email', email);

        await newUser.signUp();
        showToast('success', 'Signup successful!', 'You are now logged in!');

        const user = Parse.User.current();
        setTimeout(() => {
          setCurrentUser(user || null);
        }, 2000);
      } catch (err: any) {
        // If user already exists => code 202 => try LOGIN
        if (err?.code === 202) {
          try {
            await Parse.User.logIn(email, password);
            showToast(
              'success',
              'Existing user logged in!',
              'That user already existed, so we just logged you in!'
            );

            // Delay for toast
            const user = Parse.User.current();
            setTimeout(() => {
              setCurrentUser(user || null);
            }, 2000);
          } catch (loginErr: any) {
            showToast(
              'error',
              'Login after failed signup also failed',
              loginErr?.message ?? 'Unknown error'
            );
          }
        } else {
          showToast(
            'error',
            'Signup failed',
            err?.message ?? 'Unknown error'
          );
        }
      }
    }
  };

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [wishlistName, setWishlistName] = React.useState('');

  const handleCreateWishlist = () => {
    showToast('success', 'Wishlist Created', `Name: ${wishlistName}`);
    setWishlistName('');
    setIsModalVisible(false);
  };

  if (loadingUser) {
    return (
      <>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text>Checking user session...</Text>
          </View>
        </SafeAreaView>
        <Toast />
      </>
    );
  }

  if (currentUser) {
    return (
      <>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text h2 style={styles.title}>Wisht</Text>
            <Text style={{ marginBottom: 20 }}>
              Hello {currentUser.get('username')}!
            </Text>

            <Button
              title="Create Wisht List"
              onPress={() => setIsModalVisible(true)}
              buttonStyle={styles.button}
            />

            <NewWishlistModal
              visible={isModalVisible}
              wishlistName={wishlistName}
              setWishlistName={setWishlistName}
              onCreate={handleCreateWishlist}
              onCancel={() => {
                setIsModalVisible(false);
                setWishlistName('');
              }}
            />
          </View>
        </SafeAreaView>
        <Toast />
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text h2 style={styles.title}>Wisht</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLoginTab && styles.tabActive]}
              onPress={() => setIsLoginTab(true)}
            >
              <Text style={styles.tabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLoginTab && styles.tabActive]}
              onPress={() => setIsLoginTab(false)}
            >
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Formik<FormValues>
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  leftIcon={{ type: 'feather', name: 'mail' }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  errorMessage={
                    touched.email && errors.email ? errors.email : ''
                  }
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  leftIcon={{ type: 'feather', name: 'lock' }}
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  errorMessage={
                    touched.password && errors.password ? errors.password : ''
                  }
                />

                <Button
                  title={isLoginTab ? 'Log In' : 'Sign Up'}
                  onPress={() => handleSubmit()}
                  buttonStyle={styles.button}
                />
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
      <Toast />
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  tabActive: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

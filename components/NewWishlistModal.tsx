import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

interface NewWishlistModalProps {
  visible: boolean;
  wishlistName: string;
  setWishlistName: (name: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

/**
 * A reusable modal for creating a new wishlist.
 */
const NewWishlistModal: React.FC<NewWishlistModalProps> = ({
  visible,
  wishlistName,
  setWishlistName,
  onCreate,
  onCancel,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a New Wishlist</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Wishlist Name"
            value={wishlistName}
            onChangeText={setWishlistName}
          />

          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: '#28a745' }]}
              onPress={onCreate}
            >
              <Text style={styles.modalButtonText}>Create</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: '#999' }]}
              onPress={onCancel}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NewWishlistModal;

const styles = StyleSheet.create({
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

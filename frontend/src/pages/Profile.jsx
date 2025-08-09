import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { db } from '../lib/firebase'; // Assuming '../lib/firebase' exports your Firestore instance
import Menu from '../components/common/Menu'; // Assuming your Menu component path

function Profile() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Get user info from localStorage (assuming it contains UID)
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const userUid = userInfo?.uid;

  useEffect(() => {
    if (!userUid) {
      toast.error('User not logged in or UID missing.');
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', userUid); // Assuming user data is in a 'users' collection
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
        } else {
          toast.error('User profile not found in database.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userUid]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading('Updating profile...');

    try {
      const userDocRef = doc(db, 'users', userUid);
      await updateDoc(userDocRef, {
        email: email,
        phone: phone,
      });
      toast.dismiss();
      toast.success('Profile updated successfully! 🎉');
      setIsEditing(false); // Exit editing mode after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss();
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    // Redirect to login if user not found in localStorage
    window.location.href = '/login';
    return null; // Return null to prevent rendering before redirect
  }

  if (loading && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <p className="text-blue-700 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <Menu />
      <div className="container mx-auto px-4 py-8 mt-12 font-sans">
        <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">Your Profile 👤</h1>

        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-md mx-auto">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel" // Use type="tel" for phone numbers
                  id="phone"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md font-semibold hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-700 text-lg mb-4">
                <strong>Email:</strong> {email || 'N/A'}
              </p>
              <p className="text-gray-700 text-lg mb-6">
                <strong>Phone:</strong> {phone || 'N/A'}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default Profile;
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const profileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  address: z.string().min(1, 'Address is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile extends ProfileFormData {
  id: string;
  user_id: string;
  created_at: string;
}

export const ProfileManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(profiles || []);
    } catch (error) {
      toast.error('Error fetching profiles');
      console.error(error);
    }
  };

  const handleCreateProfile = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([data]);

      if (error) throw error;

      toast.success('Profile created successfully');
      setIsFormOpen(false);
      reset();
      fetchProfiles();
    } catch (error) {
      toast.error('Error creating profile');
      console.error(error);
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!editingProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', editingProfile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setEditingProfile(null);
      setIsFormOpen(false);
      reset();
      fetchProfiles();
    } catch (error) {
      toast.error('Error updating profile');
      console.error(error);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Profile deleted successfully');
      fetchProfiles();
    } catch (error) {
      toast.error('Error deleting profile');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        <button
          onClick={() => {
            setEditingProfile(null);
            setIsFormOpen(true);
            reset();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Profile
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <form
              onSubmit={handleSubmit(editingProfile ? handleUpdateProfile : handleCreateProfile)}
              className="bg-white p-6 rounded-lg shadow-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    defaultValue={editingProfile?.firstName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    defaultValue={editingProfile?.lastName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    defaultValue={editingProfile?.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    defaultValue={editingProfile?.phone}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    defaultValue={editingProfile?.age}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    {...register('address')}
                    defaultValue={editingProfile?.address}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingProfile(null);
                    reset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-600">{profile.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProfile(profile);
                    setIsFormOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {profile.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">Age:</span> {profile.age}
              </p>
              <p className="text-sm">
                <span className="font-medium">Address:</span> {profile.address}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 
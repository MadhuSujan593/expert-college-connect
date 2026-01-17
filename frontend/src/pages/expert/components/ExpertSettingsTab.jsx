import React, { useState } from 'react';
import { Lock, Bell, Trash2, LogOut, Shield } from 'lucide-react';
import api from '../../../utils/api';

const ExpertSettingsTab = ({ user, logout, showToast }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false
    });

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            showToast('error', 'New passwords do not match');
            return;
        }
        try {
            await api.changePassword(passwords.current, passwords.new);
            showToast('success', 'Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            showToast('error', 'Failed to update password');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Account Security */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    Security
                </h3>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-[3px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-[3px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-[3px]"
                        />
                    </div>
                    <button
                        onClick={handlePasswordChange}
                        disabled={!passwords.current || !passwords.new}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-[3px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                    >
                        Update Password
                    </button>
                </div>
            </div>

            {/* Notifications - Visual Only for now if API missing */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Notifications
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Email Notifications</p>
                            <p className="text-xs text-slate-500">Receive updates about your applications</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Marketing & Tips</p>
                            <p className="text-xs text-slate-500">Receive tips to improve your profile</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.marketing}
                            onChange={e => setNotifications({ ...notifications, marketing: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                <h3 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-slate-600 mb-4 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-[3px] hover:bg-red-50 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                </button>
            </div>

            <div className="flex justify-center pt-6">
                <button
                    onClick={logout}
                    className="text-slate-500 hover:text-slate-700 font-medium flex items-center gap-2 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
import { AlertCircle } from 'lucide-react';

export default ExpertSettingsTab;

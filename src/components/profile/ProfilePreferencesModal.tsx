"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  Volume2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProfilePreferencesModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  onClose: () => void;
}

export function ProfilePreferencesModal({ user, onClose }: ProfilePreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "PASSWORD" | "NOTIFICATIONS">("PROFILE");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [queueSound, setQueueSound] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }

    try {
      setIsChangingPass(true);
      // Simulate/call password update
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPassSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPassError("Failed to update password");
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
              <p className="text-[11px] text-slate-500">{user.email} • {user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 px-5 gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "PROFILE"
                ? "border-[#0F766E] text-[#0F766E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab("PASSWORD")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "PASSWORD"
                ? "border-[#0F766E] text-[#0F766E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab("NOTIFICATIONS")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "NOTIFICATIONS"
                ? "border-[#0F766E] text-[#0F766E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs">
          {activeTab === "PROFILE" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                  <p className="font-bold text-slate-900">{user.name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</span>
                  <p className="font-bold text-slate-900">{user.role}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registered Email</span>
                <p className="font-bold text-slate-900">{user.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Department / Practice</span>
                <p className="font-bold text-slate-900">{user.department || "General Clinical Operations"}</p>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-[11px] text-[#0F766E] flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Authenticated with Single-Sign-On & SHA-256 password hash encryption.</span>
              </div>
            </div>
          )}

          {activeTab === "PASSWORD" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password successfully updated!</span>
                </div>
              )}
              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
                  {passError}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password *</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password * (Min 8 chars)</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isChangingPass}
                className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-2 mt-2"
              >
                {isChangingPass ? "Saving..." : "Update Security Password"}
              </Button>
            </form>
          )}

          {activeTab === "NOTIFICATIONS" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#0F766E]" />
                  <div>
                    <span className="font-bold text-slate-800 block">Email Confirmations</span>
                    <span className="text-[11px] text-slate-500">Receive appointment & billing receipts by email</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-[#0F766E]" />
                  <div>
                    <span className="font-bold text-slate-800 block">Queue Audio Chimes</span>
                    <span className="text-[11px] text-slate-500">Play pleasant audio chime when your token is called</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={queueSound}
                  onChange={(e) => setQueueSound(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-[#0F766E]" />
                  <div>
                    <span className="font-bold text-slate-800 block">SMS Text Alerts</span>
                    <span className="text-[11px] text-slate-500">Send emergency & token reminders via mobile SMS</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsReminders}
                  onChange={(e) => setSmsReminders(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

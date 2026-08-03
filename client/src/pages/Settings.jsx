import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Moon, Sun, Bell, User, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService, profileService } from "../services";
import PageHeader from "../components/PageHeader";
import { getInitials } from "../utils/helpers";
import { IMAGE_BASE } from "../constants";

const Settings = () => {
  const { user, employee, darkMode, setDarkMode, updateEmployee, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [imageFile, setImageFile] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    leave: true,
    payslip: true,
  });

  const profileForm = useForm();
  const passwordForm = useForm();

  useEffect(() => {
    if (employee) {
      profileForm.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        bio: employee.bio,
      });
    }
  }, [employee, profileForm]);

  const onProfileSubmit = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      const res = await profileService.update(fd);
      updateEmployee(res.data.data);
      toast.success("Profile updated");
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: darkMode ? Moon : Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 card p-6">
          {activeTab === "profile" && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-6">Profile Settings</h3>
              {employee ? (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                      {employee.image ? (
                        <img src={`${IMAGE_BASE}${employee.image}`} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : getInitials(employee.firstName, employee.lastName)}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-slate-700 mb-1 block">First Name</label><input {...profileForm.register("firstName")} /></div>
                    <div><label className="text-sm font-medium text-slate-700 mb-1 block">Last Name</label><input {...profileForm.register("lastName")} /></div>
                  </div>
                  <div><label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label><input {...profileForm.register("phone")} /></div>
                  <div><label className="text-sm font-medium text-slate-700 mb-1 block">Bio</label><textarea rows={3} {...profileForm.register("bio")} /></div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Email: <span className="font-medium">{user?.email}</span></p>
                  <p className="text-sm text-slate-600">Role: <span className="font-medium">{user?.role}</span></p>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-6">Change Password</h3>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
                <div><label className="text-sm font-medium text-slate-700 mb-1 block">Current Password</label><input type="password" {...passwordForm.register("currentPassword", { required: true })} /></div>
                <div><label className="text-sm font-medium text-slate-700 mb-1 block">New Password</label><input type="password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} /></div>
                <div><label className="text-sm font-medium text-slate-700 mb-1 block">Confirm Password</label><input type="password" {...passwordForm.register("confirmPassword", { required: true })} /></div>
                <button type="submit" className="btn-primary">Update Password</button>
              </form>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-6">Appearance</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 max-w-lg">
                <div>
                  <p className="font-medium text-slate-900">Dark Mode</p>
                  <p className="text-sm text-slate-500">Toggle dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-6">Notifications</h3>
              <div className="space-y-3 max-w-lg">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "leave", label: "Leave Updates", desc: "Get notified about leave status" },
                  { key: "payslip", label: "Payslip Alerts", desc: "Notify when payslip is generated" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? "bg-indigo-600" : "bg-slate-300"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

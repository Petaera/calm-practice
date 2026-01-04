import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Lock, Bell, Download, Trash2, Shield, Clock, Calendar, DollarSign, Globe, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTherapistSettings, useUpsertTherapistSettings } from "@/hooks/use-therapist-settings";
import { updateTherapist } from "@/services/therapist.service";
import { useToast } from "@/hooks/use-toast";
import type { TherapistSettingsInsert, TherapistUpdate } from "@/lib/supabase";

const Settings = () => {
  const { therapist } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: settings, isLoading } = useTherapistSettings(therapist?.id);
  const { mutate: upsertSettings, isLoading: isSaving } = useUpsertTherapistSettings();

  // Therapist profile form state
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    practice_name: "",
    license_number: "",
    specialization: "",
    phone: "",
  });

  // Settings form state
  const [formData, setFormData] = useState<Partial<TherapistSettingsInsert>>({
    therapist_id: therapist?.id || "",
    timezone: "America/New_York",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    currency: "USD",
    language: "en",
    theme: "light",
    default_session_duration: 50,
    session_buffer_minutes: 10,
    default_session_fee: null,
    cancellation_policy: "",
    late_cancellation_hours: 24,
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    reminder_hours_before: 24,
    task_due_reminders: true,
    payment_reminders: true,
    session_timeout_minutes: 30,
    require_2fa: false,
    auto_logout: true,
    calendar_view: "week",
    working_hours_start: "09:00:00",
    working_hours_end: "17:00:00",
  });

  // Load therapist profile data
  useEffect(() => {
    if (therapist) {
      setProfileData({
        full_name: therapist.full_name || "",
        email: therapist.email || "",
        practice_name: therapist.practice_name || "",
        license_number: therapist.license_number || "",
        specialization: therapist.specialization || "",
        phone: therapist.phone || "",
      });
    }
  }, [therapist]);

  // Load settings when they're fetched
  useEffect(() => {
    if (settings) {
      setFormData({
        therapist_id: settings.therapist_id,
        timezone: settings.timezone || "America/New_York",
        date_format: settings.date_format || "MM/DD/YYYY",
        time_format: settings.time_format || "12h",
        currency: settings.currency || "USD",
        language: settings.language || "en",
        theme: settings.theme || "light",
        default_session_duration: settings.default_session_duration || 50,
        session_buffer_minutes: settings.session_buffer_minutes || 10,
        default_session_fee: settings.default_session_fee,
        cancellation_policy: settings.cancellation_policy || "",
        late_cancellation_hours: settings.late_cancellation_hours || 24,
        email_notifications: settings.email_notifications ?? true,
        sms_notifications: settings.sms_notifications ?? false,
        appointment_reminders: settings.appointment_reminders ?? true,
        reminder_hours_before: settings.reminder_hours_before || 24,
        task_due_reminders: settings.task_due_reminders ?? true,
        payment_reminders: settings.payment_reminders ?? true,
        session_timeout_minutes: settings.session_timeout_minutes || 30,
        require_2fa: settings.require_2fa ?? false,
        auto_logout: settings.auto_logout ?? true,
        calendar_view: settings.calendar_view || "week",
        working_hours_start: settings.working_hours_start || "09:00:00",
        working_hours_end: settings.working_hours_end || "17:00:00",
      });
    }
  }, [settings]);

  // Set therapist_id when therapist is loaded
  useEffect(() => {
    if (therapist?.id) {
      setFormData((prev) => ({ ...prev, therapist_id: therapist.id }));
    }
  }, [therapist?.id]);

  const handleSaveProfile = async () => {
    if (!therapist?.id) {
      toast({
        title: "Error",
        description: "Therapist ID is missing. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates: TherapistUpdate = {
        full_name: profileData.full_name,
        practice_name: profileData.practice_name,
        license_number: profileData.license_number,
        specialization: profileData.specialization,
        phone: profileData.phone,
      };

      const result = await updateTherapist(therapist.id, updates);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      // Reload the page to refresh the auth context with new data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!therapist?.id) {
      toast({
        title: "Error",
        description: "Therapist ID is missing. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertSettings(formData as TherapistSettingsInsert);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your profile, preferences, and security.</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11"
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription>Your personal and clinical profile details.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.full_name} 
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input 
                    id="specialization" 
                    value={profileData.specialization} 
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={profileData.email} 
                    disabled
                    className="rounded-xl border-border/50 h-11 bg-muted/30" 
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practice_name">Practice Name</Label>
                  <Input 
                    id="practice_name" 
                    value={profileData.practice_name} 
                    onChange={(e) => setProfileData({ ...profileData, practice_name: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                    placeholder="Your Practice Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input 
                    id="license_number" 
                    value={profileData.license_number} 
                    onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                    placeholder="License #"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 mt-4"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> General Preferences
              </CardTitle>
              <CardDescription>Regional settings and display preferences.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                      <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                      <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select 
                    value={formData.date_format} 
                    onValueChange={(value) => setFormData({ ...formData, date_format: value })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_format">Time Format</Label>
                  <Select 
                    value={formData.time_format} 
                    onValueChange={(value) => setFormData({ ...formData, time_format: value })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Appearance
              </CardTitle>
              <CardDescription>Customize your dashboard appearance.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={formData.theme} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, theme: value });
                    setTheme(value as "light" | "dark" | "auto");
                  }}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (Time-based)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.theme === "auto" 
                    ? "Automatically switches between light (6 AM - 6 PM) and dark (6 PM - 6 AM) themes" 
                    : formData.theme === "dark" 
                    ? "Dark theme for reduced eye strain" 
                    : "Light theme for bright environments"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Defaults */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Session Defaults
              </CardTitle>
              <CardDescription>Default settings for therapy sessions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_duration">Session Duration (min)</Label>
                  <Input 
                    id="session_duration" 
                    type="number"
                    value={formData.default_session_duration || ""} 
                    onChange={(e) => setFormData({ ...formData, default_session_duration: parseInt(e.target.value) || 50 })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer_minutes">Buffer Time (min)</Label>
                  <Input 
                    id="buffer_minutes" 
                    type="number"
                    value={formData.session_buffer_minutes || ""} 
                    onChange={(e) => setFormData({ ...formData, session_buffer_minutes: parseInt(e.target.value) || 10 })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Timeout (min)</Label>
                  <Input 
                    id="session_timeout" 
                    type="number"
                    value={formData.session_timeout_minutes || ""} 
                    onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 30 })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_fee">Default Session Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="default_fee" 
                    type="number"
                    step="0.01"
                    value={formData.default_session_fee || ""} 
                    onChange={(e) => setFormData({ ...formData, default_session_fee: parseFloat(e.target.value) || null })}
                    className="rounded-xl border-border/50 h-11 pl-8" 
                    placeholder="150.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Cancellation Policy
              </CardTitle>
              <CardDescription>Define your cancellation terms and late policy.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea 
                  id="cancellation_policy" 
                  value={formData.cancellation_policy || ""} 
                  onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                  className="rounded-xl border-border/50 min-h-24" 
                  placeholder="Describe your cancellation policy..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="late_hours">Late Cancellation Hours</Label>
                <Input 
                  id="late_hours" 
                  type="number"
                  value={formData.late_cancellation_hours || ""} 
                  onChange={(e) => setFormData({ ...formData, late_cancellation_hours: parseInt(e.target.value) || 24 })}
                  className="rounded-xl border-border/50 h-11" 
                />
                <p className="text-xs text-muted-foreground">
                  Minimum hours notice required to avoid late cancellation fees.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Working Hours
              </CardTitle>
              <CardDescription>Set your typical working schedule.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input 
                    id="start_time" 
                    type="time"
                    value={formData.working_hours_start || ""} 
                    onChange={(e) => setFormData({ ...formData, working_hours_start: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input 
                    id="end_time" 
                    type="time"
                    value={formData.working_hours_end || ""} 
                    onChange={(e) => setFormData({ ...formData, working_hours_end: e.target.value })}
                    className="rounded-xl border-border/50 h-11" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calendar_view">Default Calendar View</Label>
                <Select 
                  value={formData.calendar_view} 
                  onValueChange={(value) => setFormData({ ...formData, calendar_view: value })}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email.</p>
                  </div>
                  <Switch 
                    checked={formData.email_notifications} 
                    onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via text message.</p>
                  </div>
                  <Switch 
                    checked={formData.sms_notifications} 
                    onCheckedChange={(checked) => setFormData({ ...formData, sms_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Appointment Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded about upcoming sessions.</p>
                  </div>
                  <Switch 
                    checked={formData.appointment_reminders} 
                    onCheckedChange={(checked) => setFormData({ ...formData, appointment_reminders: checked })}
                  />
                </div>
                {formData.appointment_reminders && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="reminder_hours">Reminder Time (hours before)</Label>
                    <Input 
                      id="reminder_hours" 
                      type="number"
                      value={formData.reminder_hours_before || ""} 
                      onChange={(e) => setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) || 24 })}
                      className="rounded-xl border-border/50 h-11" 
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Task Due Reminders</p>
                    <p className="text-xs text-muted-foreground">Notifications for task deadlines.</p>
                  </div>
                  <Switch 
                    checked={formData.task_due_reminders} 
                    onCheckedChange={(checked) => setFormData({ ...formData, task_due_reminders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Payment Reminders</p>
                    <p className="text-xs text-muted-foreground">Notifications for pending payments.</p>
                  </div>
                  <Switch 
                    checked={formData.payment_reminders} 
                    onCheckedChange={(checked) => setFormData({ ...formData, payment_reminders: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Security & Access
              </CardTitle>
              <CardDescription>Protect your practice data with additional security.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security.</p>
                </div>
                <Switch 
                  checked={formData.require_2fa} 
                  onCheckedChange={(checked) => setFormData({ ...formData, require_2fa: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Auto Logout</p>
                  <p className="text-xs text-muted-foreground">Automatically log out after inactivity.</p>
                </div>
                <Switch 
                  checked={formData.auto_logout} 
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_logout: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" /> Privacy Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                PracMind is designed for your private use. No data is shared with external parties. You have full control over your records.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Data Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Button variant="outline" className="w-full justify-start gap-2 h-11 rounded-xl border-border hover:bg-muted/50">
                <Download className="w-4 h-4" /> Export All Data (JSON)
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="w-4 h-4" /> Wipe Local Database
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 px-8"
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Lock, Bell, Download, Trash2, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const [showPin, setShowPin] = useState(false);

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your profile, security, and data.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>Your public and clinical profile information.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Dr. Sarah Robinson" className="rounded-xl border-border/50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Clinical Title</Label>
                  <Input id="title" defaultValue="Clinical Psychologist" className="rounded-xl border-border/50 h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" defaultValue="sarah.robinson@practicemind.com" className="rounded-xl border-border/50 h-11" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 mt-4">
                Update Profile
              </Button>
            </CardContent>
          </Card>

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
                  <p className="text-sm font-semibold">Enable Dashboard PIN</p>
                  <p className="text-xs text-muted-foreground">Require a 4-digit PIN for quick access.</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current PIN</Label>
                  <div className="relative">
                    <Input 
                      type={showPin ? "text" : "password"} 
                      defaultValue="4829" 
                      className="rounded-xl border-border/50 h-11 pr-10" 
                    />
                    <button 
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl border-border h-11">
                  Change Access PIN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" /> Privacy Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                PracticeMind is designed for your private use. No data is shared with external parties. You have full control over your records.
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
    </DashboardLayout>
  );
};

export default Settings;


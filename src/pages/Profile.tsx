import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Calendar, Droplet, AlertTriangle, Edit, Save } from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/authService";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = authService.getCurrentUser();

  const userProfile = {
    name: currentUser?.name || "User",
    email: currentUser?.email || "user@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    age: 38,
    bloodGroup: "A+",
    allergies: ["Penicillin", "Peanuts"],
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
    medicalConditions: ["Type 2 Diabetes", "Hypertension"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground">Manage your personal and medical information</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
              {userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">{userProfile.name}</h3>
              <p className="text-muted-foreground mb-4">{userProfile.email}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                  <Droplet className="w-3 h-3" />
                  Blood Type: {userProfile.bloodGroup}
                </Badge>
                <Badge className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  <Calendar className="w-3 h-3" />
                  Age: {userProfile.age}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={userProfile.name}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={userProfile.email}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={userProfile.phone}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  defaultValue={userProfile.dateOfBirth}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood">Blood Group</Label>
                <Input
                  id="blood"
                  defaultValue={userProfile.bloodGroup}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Medical Information
            </CardTitle>
            <CardDescription>Important health details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                {userProfile.allergies.map((allergy) => (
                  <Badge key={allergy} variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {allergy}
                  </Badge>
                ))}
                {isEditing && (
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    + Add
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Medical Conditions</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                {userProfile.medicalConditions.map((condition) => (
                  <Badge
                    key={condition}
                    className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
                  >
                    {condition}
                  </Badge>
                ))}
                {isEditing && (
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    + Add
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Emergency Contact
            </CardTitle>
            <CardDescription>In case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency-name">Contact Name</Label>
              <Input
                id="emergency-name"
                defaultValue={userProfile.emergencyContact.name}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                defaultValue={userProfile.emergencyContact.relationship}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-phone">Phone Number</Label>
              <Input
                id="emergency-phone"
                type="tel"
                defaultValue={userProfile.emergencyContact.phone}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any other important medical information</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional medical notes, dietary restrictions, or important information..."
              className="min-h-[150px]"
              disabled={!isEditing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

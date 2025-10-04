import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Reminder {
  id: string;
  medicine: string;
  dosage: string;
  time: string;
  status: "upcoming" | "taken" | "missed" | "pending";
  date: string;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      medicine: "Metformin",
      dosage: "500mg",
      time: "8:00 AM",
      status: "taken",
      date: "Today",
    },
    {
      id: "2",
      medicine: "Aspirin",
      dosage: "100mg",
      time: "9:00 AM",
      status: "taken",
      date: "Today",
    },
    {
      id: "3",
      medicine: "Vitamin D3",
      dosage: "2000 IU",
      time: "9:00 AM",
      status: "taken",
      date: "Today",
    },
    {
      id: "4",
      medicine: "Aspirin",
      dosage: "100mg",
      time: "2:00 PM",
      status: "upcoming",
      date: "Today",
    },
    {
      id: "5",
      medicine: "Omega-3",
      dosage: "1000mg",
      time: "8:00 PM",
      status: "upcoming",
      date: "Today",
    },
    {
      id: "6",
      medicine: "Vitamin C",
      dosage: "500mg",
      time: "9:00 AM",
      status: "missed",
      date: "Yesterday",
    },
  ]);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders_data');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reminders_data', JSON.stringify(reminders));
  }, [reminders]);

  const handleMarkAsTaken = (id: string) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id
          ? { ...reminder, status: "taken" as const }
          : reminder
      )
    );
  };

  const getStatusBadge = (status: Reminder["status"]) => {
    switch (status) {
      case "taken":
        return (
          <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
            <CheckCircle className="w-3 h-3" />
            Taken
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            <Clock className="w-3 h-3" />
            Upcoming
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Missed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Pending
          </Badge>
        );
    }
  };

  const todayReminders = reminders.filter((r) => r.date === "Today");
  const pastReminders = reminders.filter((r) => r.date !== "Today");
  
  // Calculate stats
  const takenToday = todayReminders.filter(r => r.status === "taken").length;
  const totalToday = todayReminders.length;
  const upcomingCount = todayReminders.filter(r => r.status === "upcoming").length;
  const missedCount = reminders.filter(r => r.status === "missed").length;
  const completionPercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reminders & Alerts</h2>
        <p className="text-muted-foreground">Track your medicine intake schedule</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Today's Doses</p>
                <p className="text-3xl font-bold text-foreground">{takenToday}/{totalToday}</p>
                <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% completed</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-foreground">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{upcomingCount > 0 ? 'Pending doses' : 'All caught up!'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Missed</p>
                <p className="text-3xl font-bold text-foreground">{missedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Reminders */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your medicine reminders for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {reminder.medicine} {reminder.dosage}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {reminder.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(reminder.status)}
                  {reminder.status === "upcoming" && (
                    <Button size="sm" onClick={() => handleMarkAsTaken(reminder.id)}>
                      Mark as Taken
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Reminders */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Past Reminders</CardTitle>
          <CardDescription>Your medicine history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pastReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {reminder.medicine} {reminder.dosage}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {reminder.date} at {reminder.time}
                    </p>
                  </div>
                </div>
                {getStatusBadge(reminder.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

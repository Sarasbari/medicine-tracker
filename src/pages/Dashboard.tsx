import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Bell, Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import { reminderService } from "@/services/reminderService";
import { authService } from "@/services/authService";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeReminder = async (reminderId: number) => {
    try {
      await reminderService.markReminderAsTaken(reminderId);
      // Reload dashboard data to reflect changes
      loadDashboardData();
    } catch (error) {
      console.error('Failed to mark reminder as taken:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="health-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard data</div>;
  }

  const stats = [
    {
      title: "Active Medicines",
      value: dashboardData.stats.activeMedicines.toString(),
      description: "Currently taking",
      icon: Pill,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Doses",
      value: dashboardData.stats.todaysDoseCompletion,
      description: "Taken today",
      icon: CheckCircle,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Upcoming Reminders",
      value: dashboardData.stats.upcomingReminders.toString(),
      description: "In next 4 hours",
      icon: Bell,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Low Stock Alerts",
      value: dashboardData.stats.lowStockMedicines.toString(),
      description: "Needs refill",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="health-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, {currentUser?.name || 'User'}! 👋
            </h2>
            <p className="text-muted-foreground">Here's your health overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold text-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Doses */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Upcoming Doses
            </CardTitle>
            <CardDescription>Your scheduled medicines for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.upcomingReminders.slice(0, 3).map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {reminder.medicine.name} {reminder.medicine.dosage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reminder.reminderTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleTakeReminder(reminder.id!)}
                  disabled={reminder.taken}
                >
                  {reminder.taken ? 'Taken' : 'Take Now'}
                </Button>
              </div>
            ))}
            <Link to="/reminders">
              <Button variant="ghost" className="w-full">View All Reminders</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Next Appointment */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Next Appointment
            </CardTitle>
            <CardDescription>Your upcoming doctor visit</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.nextAppointment ? (
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {dashboardData.nextAppointment.doctorName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      {dashboardData.nextAppointment.doctorName}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {dashboardData.nextAppointment.specialty}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-foreground font-medium">
                        📅 {new Date(dashboardData.nextAppointment.date).toLocaleDateString()}
                      </span>
                      <span className="text-foreground font-medium">
                        🕐 {dashboardData.nextAppointment.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
              </div>
            )}
            <Link to="/appointments">
              <Button variant="ghost" className="w-full mt-3">Manage Appointments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your medicine tracking history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.overdueReminders.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-900">
                  {dashboardData.overdueReminders.length} overdue reminder{dashboardData.overdueReminders.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-700">Please take your missed medications</p>
              </div>
            )}
            {dashboardData.lowStockMedicines.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-900">
                  {dashboardData.lowStockMedicines.length} medicine{dashboardData.lowStockMedicines.length > 1 ? 's' : ''} running low
                </p>
                <p className="text-xs text-red-700">Consider refilling soon</p>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {dashboardData.stats.todaysTakenReminders} doses taken today
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.todaysPendingReminders} remaining
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {dashboardData.stats.activeMedicines} active medicines
                </p>
                <p className="text-xs text-muted-foreground">In your medicine cabinet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

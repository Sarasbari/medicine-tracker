import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Clock, AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { medicineService, Medicine } from "@/services/medicineService";

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    intakeTimes: [''],
    stock: 0,
    threshold: 0,
    notes: '',
    active: true
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeMedicine = async (id: number) => {
    try {
      await medicineService.takeMedicine(id);
      loadMedicines(); // Reload to get updated stock
    } catch (error) {
      console.error('Failed to take medicine:', error);
    }
  };

  const handleCreateMedicine = async () => {
    try {
      const medicineData = {
        ...newMedicine,
        intakeTimes: newMedicine.intakeTimes.filter(time => time.trim() !== '')
      };
      await medicineService.createMedicine(medicineData);
      setDialogOpen(false);
      setNewMedicine({
        name: '',
        dosage: '',
        frequency: '',
        intakeTimes: [''],
        stock: 0,
        threshold: 0,
        notes: '',
        active: true
      });
      loadMedicines();
    } catch (error) {
      console.error('Failed to create medicine:', error);
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    try {
      await medicineService.deleteMedicine(id);
      loadMedicines();
    } catch (error) {
      console.error('Failed to delete medicine:', error);
    }
  };

  const getLowStockCount = () => medicines.filter((m) => m.stock <= m.threshold).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Medicines</h2>
          <p className="text-muted-foreground">Manage your medicine inventory and schedules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>Fill in the details for your new medicine</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Aspirin" 
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input 
                    id="dosage" 
                    placeholder="e.g., 100mg" 
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input 
                    id="frequency" 
                    placeholder="e.g., Once daily" 
                    value={newMedicine.frequency}
                    onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="intakeTime">Intake Time</Label>
                <Input 
                  id="intakeTime" 
                  placeholder="e.g., 8:00 AM" 
                  value={newMedicine.intakeTimes[0]}
                  onChange={(e) => setNewMedicine({...newMedicine, intakeTimes: [e.target.value]})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="30" 
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine({...newMedicine, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Refill Threshold</Label>
                  <Input 
                    id="threshold" 
                    type="number" 
                    placeholder="10" 
                    value={newMedicine.threshold}
                    onChange={(e) => setNewMedicine({...newMedicine, threshold: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any special instructions..." 
                  value={newMedicine.notes}
                  onChange={(e) => setNewMedicine({...newMedicine, notes: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleCreateMedicine}>Add Medicine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Banner */}
      {getLowStockCount() > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">
                {getLowStockCount()} medicine{getLowStockCount() > 1 ? "s" : ""} running low on stock
              </p>
              <p className="text-sm text-amber-700">Consider refilling soon to avoid running out</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicine Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {medicines.map((medicine) => {
          const isLowStock = medicine.stock <= medicine.threshold;
          return (
            <Card key={medicine.id} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{medicine.name}</CardTitle>
                      <CardDescription>{medicine.dosage}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteMedicine(medicine.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{medicine.frequency}</span>
                  <span className="text-foreground font-medium">
                    {medicine.intakeTimes.join(", ")}
                  </span>
                </div>

                {medicine.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    💡 {medicine.notes}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Stock Level</p>
                    <div className="flex items-center gap-2">
                      {isLowStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                          <CheckCircle className="w-3 h-3" />
                          In Stock
                        </Badge>
                      )}
                      <span className="text-lg font-bold text-foreground">
                        {medicine.stock} pills
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleTakeMedicine(medicine.id!)}
                    disabled={medicine.stock === 0}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Take Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

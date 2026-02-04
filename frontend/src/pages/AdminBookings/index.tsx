import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Search,
  Video,
  MapPin,
  User,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface Booking {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  service_id: number;
  service_name: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
  appointment_type: 'online' | 'in-person';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  video_call_link?: string;
  notes?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <AlertCircle className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.patient_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.appointment_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    try {
      const [hours, minutes] = startTime.split(':');
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + durationMinutes;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    } catch {
      return startTime;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all appointment bookings
            </p>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by service, patient name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#2c4d5c]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No bookings have been made yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4"
                style={{
                  borderLeftColor:
                    booking.status === 'confirmed'
                      ? '#22c55e'
                      : booking.status === 'pending'
                      ? '#eab308'
                      : booking.status === 'cancelled'
                      ? '#ef4444'
                      : '#3b82f6',
                }}
                onClick={() => handleBookingClick(booking)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {booking.service_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.patient_name}
                      </p>
                    </div>
                    <Badge
                      className={`${statusColors[booking.status]} text-xs flex items-center gap-1`}
                    >
                      {statusIcons[booking.status]}
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(booking.slot_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatTime(booking.slot_time)} - {formatTime(calculateEndTime(booking.slot_time, booking.duration_minutes || 30))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-xs truncate">{booking.patient_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.appointment_type === 'online' ? (
                        <>
                          <Video className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">Online Consultation</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">In-Person Visit</span>
                        </>
                      )}
                    </div>
                    {booking.appointment_type === 'online' && booking.video_call_link && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <a
                          href={booking.video_call_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Google Meet</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Booked on {formatDate(booking.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {selectedBooking.service_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusColors[selectedBooking.status]}>
                      {selectedBooking.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        selectedBooking.appointment_type === 'online'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-green-500 text-green-600'
                      }
                    >
                      {selectedBooking.appointment_type === 'online' ? (
                        <Video className="h-3 w-3 mr-1" />
                      ) : (
                        <MapPin className="h-3 w-3 mr-1" />
                      )}
                      {selectedBooking.appointment_type === 'online'
                        ? 'Online'
                        : 'In-Person'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-5 w-5 text-[#2c4d5c]" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.slot_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5 text-[#2c4d5c]" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">
                        {formatTime(selectedBooking.slot_time)} - {formatTime(calculateEndTime(selectedBooking.slot_time, selectedBooking.duration_minutes || 30))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.patient_email}</span>
                    </div>
                    {selectedBooking.patient_phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedBooking.patient_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.appointment_type === 'online' &&
                  selectedBooking.video_call_link && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Video Call Link
                      </h4>
                      <a
                        href={selectedBooking.video_call_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-blue-50 hover:bg-blue-100 rounded-lg p-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 rounded-full p-2">
                            <Video className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-700">
                              Join Google Meet
                            </p>
                            <p className="text-xs text-blue-500 truncate max-w-[200px]">
                              {selectedBooking.video_call_link}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-blue-500 group-hover:text-blue-700" />
                      </a>
                    </div>
                  )}

                {selectedBooking.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Notes
                    </h4>
                    <p className="text-gray-700 text-sm">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 text-xs text-gray-400">
                  <p>Booking ID: #{selectedBooking.id}</p>
                  <p>Created: {formatDate(selectedBooking.created_at)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

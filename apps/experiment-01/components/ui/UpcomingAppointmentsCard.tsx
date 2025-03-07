
import React from 'react';
import { Calendar, Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UpcomingAppointmentsCard = () => {
  return (
    <Card className="upcoming-appointments-card h-full">
      <CardHeader className="upcoming-appointments-header">
        <CardTitle className="upcoming-appointments-title">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="upcoming-appointments-content">
        <div className="appointment-item calendar">
          <div className="flex items-center">
            <span className="appointment-icon calendar">
              <Calendar size={14} />
            </span>
            <div>
              <div className="appointment-item-title">Property Viewing</div>
              <div className="appointment-item-time">Today, 2:30 PM</div>
            </div>
          </div>
        </div>
        
        <div className="appointment-item users">
          <div className="flex items-center">
            <span className="appointment-icon users">
              <Users size={14} />
            </span>
            <div>
              <div className="appointment-item-title">Client Meeting</div>
              <div className="appointment-item-time">Tomorrow, 10:00 AM</div>
            </div>
          </div>
        </div>
        
        <div className="appointment-item calendar">
          <div className="flex items-center">
            <span className="appointment-icon calendar">
              <Calendar size={14} />
            </span>
            <div>
              <div className="appointment-item-title">Open House</div>
              <div className="appointment-item-time">Friday, 1:00 PM</div>
            </div>
          </div>
        </div>

        <div className="appointment-item users">
          <div className="flex items-center">
            <span className="appointment-icon users">
              <Users size={14} />
            </span>
            <div>
              <div className="appointment-item-title">Buyer Consultation</div>
              <div className="appointment-item-time">Next Monday, 11:30 AM</div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-4 text-center">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center w-full">
            <Plus size={16} className="mr-1" />
            Add New Appointment
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointmentsCard;
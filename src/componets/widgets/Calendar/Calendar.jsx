import React, { useState } from 'react';
import './Calendar.css';

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "ЈАНУАРИ", "ФЕВРУАРИ", "МАРТ", "АПРИЛ", "МАЈ", "ЈУНИ",
        "ЈУЛИ", "АВГУСТ", "СЕПТЕМВРИ", "ОКТОМВРИ", "НОЕМВРИ", "ДЕКЕМВРИ"
    ];

    const daysOfWeek = ["Н", "П", "В", "С", "Ч", "П", "С"];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const days = getDaysInMonth(currentDate);
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isCurrentMonth = currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear;

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <span className="month-year">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
            </div>

            <div className="calendar-grid">
                <div className="days-header">
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className="day-header">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="days-grid">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day === today && isCurrentMonth ? 'today' : ''
                                } ${day ? 'valid-day' : 'empty-day'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
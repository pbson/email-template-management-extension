import React, { useState, useEffect } from 'react'
import { ChevronRight, LogOut, Calendar, Clock, AlertCircle } from 'lucide-react'
import {
    startOfToday,
    endOfDay,
    addDays,
    isWithinInterval,
    formatISO,
    parseISO,
    eachDayOfInterval,
    format
} from 'date-fns'
import scheduleApi from '../features/schedule/schedule.api'
import toast from 'react-hot-toast'

const Popup = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userSchedule, setUserSchedule] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [startDate, setStartDate] = useState(startOfToday())
    const [endDate, setEndDate] = useState(addDays(new Date(), 7))

    useEffect(() => {
        checkLoginStatus()
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserSchedule()
        }
    }, [isLoggedIn, startDate, endDate])

    const checkLoginStatus = () => {
        chrome.storage.local.get(['jwt'], result => {
            const isLoggedIn = !!result.jwt
            setIsLoggedIn(isLoggedIn)
            setIsLoading(false)
            if (isLoggedIn) {
                localStorage.setItem('jwt', result.jwt)
                fetchUserSchedule()
            }
        })
    }

    const fetchUserSchedule = async () => {
        try {
            const response = await scheduleApi.getList()
            console.log(1111, response)
            const processedSchedule = processScheduleForRange(response.data.data)
            setUserSchedule(processedSchedule)
        } catch (error) {
            toast.error('Failed to fetch schedule')
        }
    }

    const processScheduleForRange = schedules => {
        const start = startDate
        const end = endDate
        const processed = []

        schedules.forEach(schedule => {
            const { recurrence, start_timestamp, end_timestamp } = schedule
            const scheduleStartDate = parseISO(start_timestamp)
            const scheduleEndDate = end_timestamp ? parseISO(end_timestamp) : null

            if (recurrence) {
                const {
                    frequency,
                    interval = 1,
                    days_of_week,
                    days_of_month,
                    months_of_year
                } = recurrence
                switch (frequency) {
                    case 'Daily':
                        eachDayOfInterval({ start, end: end || endOfDay(new Date()) }).forEach(
                            date => {
                                if (
                                    isWithinInterval(date, {
                                        start: scheduleStartDate,
                                        end: scheduleEndDate || end
                                    })
                                ) {
                                    processed.push(createEvent(schedule, date))
                                }
                            }
                        )
                        break
                    case 'Weekly':
                        eachDayOfInterval({ start, end: end || endOfDay(new Date()) }).forEach(
                            date => {
                                if (
                                    isWithinInterval(date, {
                                        start: scheduleStartDate,
                                        end: scheduleEndDate || end
                                    }) &&
                                    date.getDay() === scheduleStartDate.getDay()
                                ) {
                                    processed.push(createEvent(schedule, date))
                                }
                            }
                        )
                        break
                    case 'Monthly':
                        eachDayOfInterval({ start, end: end || endOfDay(new Date()) }).forEach(
                            date => {
                                if (
                                    isWithinInterval(date, {
                                        start: scheduleStartDate,
                                        end: scheduleEndDate || end
                                    }) &&
                                    date.getDate() === scheduleStartDate.getDate()
                                ) {
                                    processed.push(createEvent(schedule, date))
                                }
                            }
                        )
                        break
                    case 'Yearly':
                        eachDayOfInterval({ start, end: end || endOfDay(new Date()) }).forEach(
                            date => {
                                if (
                                    isWithinInterval(date, {
                                        start: scheduleStartDate,
                                        end: scheduleEndDate || end
                                    }) &&
                                    date.getDate() === scheduleStartDate.getDate() &&
                                    date.getMonth() === scheduleStartDate.getMonth()
                                ) {
                                    processed.push(createEvent(schedule, date))
                                }
                            }
                        )
                        break
                    case 'Custom':
                        processCustomRecurrence(
                            schedule,
                            scheduleStartDate,
                            scheduleEndDate,
                            start,
                            end,
                            processed
                        )
                        break
                    case 'OneTime':
                    default:
                        if (
                            isWithinInterval(scheduleStartDate, {
                                start,
                                end
                            })
                        ) {
                            processed.push(createEvent(schedule, scheduleStartDate))
                        }
                        break
                }
            } else {
                if (isWithinInterval(scheduleStartDate, { start, end })) {
                    processed.push(createEvent(schedule, scheduleStartDate))
                }
            }
        })

        return processed
    }

    const processCustomRecurrence = (
        schedule,
        scheduleStartDate,
        scheduleEndDate,
        currentRangeStart,
        currentRangeEnd,
        processed
    ) => {
        const { days_of_week, days_of_month, months_of_year } = schedule.recurrence

        if (days_of_week) {
            const daysOfWeekArray = days_of_week.split(',')
            eachDayOfInterval({ start: currentRangeStart, end: currentRangeEnd }).forEach(date => {
                if (
                    daysOfWeekArray.includes(format(date, 'EEEE')) &&
                    isWithinInterval(date, {
                        start: scheduleStartDate,
                        end: scheduleEndDate || currentRangeEnd
                    })
                ) {
                    processed.push(createEvent(schedule, date))
                }
            })
        }

        if (days_of_month) {
            const daysOfMonthArray = days_of_month.split(',').map(Number)
            eachDayOfInterval({ start: currentRangeStart, end: currentRangeEnd }).forEach(date => {
                if (
                    daysOfMonthArray.includes(date.getDate()) &&
                    isWithinInterval(date, {
                        start: scheduleStartDate,
                        end: scheduleEndDate || currentRangeEnd
                    })
                ) {
                    processed.push(createEvent(schedule, date))
                }
            })
        }

        if (months_of_year) {
            const monthsOfYearArray = months_of_year.split(',')
            eachDayOfInterval({ start: currentRangeStart, end: currentRangeEnd }).forEach(date => {
                if (
                    monthsOfYearArray.includes(format(date, 'MMMM')) &&
                    isWithinInterval(date, {
                        start: scheduleStartDate,
                        end: scheduleEndDate || currentRangeEnd
                    })
                ) {
                    processed.push(createEvent(schedule, date))
                }
            })
        }
    }

    const createEvent = (schedule, date) => {
        return {
            ...schedule,
            date: formatISO(date, { representation: 'date' }),
            time: formatISO(date, { representation: 'time' })
        }
    }

    const handleLogout = () => {
        chrome.storage.local.remove('jwt', () => {
            setIsLoggedIn(false)
            setUserSchedule([])
        })
        localStorage.removeItem('jwt')
    }

    const handleDateRangeChange = e => {
        const { name, value } = e.target
        if (name === 'startDate') {
            setStartDate(parseISO(value))
        } else {
            setEndDate(parseISO(value))
        }
    }

    if (isLoading) {
        return (
            <div className="isolation w-80 h-96 bg-white text-gray-800 p-6 flex items-center justify-center">
                <div className="text-[#006C50]">Loading...</div>
            </div>
        )
    }

    if (!isLoggedIn) {
        return (
            <div className="isolation w-80 h-96 bg-white text-gray-800 p-6 flex flex-col justify-between shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold mb-4 text-[#006C50]">Sussex Tutor Assist</h1>
                    <p className="mb-6">
                        Welcome, University of Sussex tutor. Please sign in to access your schedule
                        and email assistance tools.
                    </p>
                </div>
                <button
                    onClick={() => chrome.tabs.create({ url: import.meta.env.VITE_LOGIN_URL })}
                    className="bg-[#006C50] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#005a43] transition duration-300 flex items-center justify-center"
                >
                    Sign In
                    <ChevronRight className="ml-2" size={20} />
                </button>
            </div>
        )
    }

    return (
        <div className="isolation">
            <div className="isolation w-96 h-[32rem] bg-white text-gray-800 p-6 flex flex-col shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-[#006C50]">Upcoming Schedule</h1>
                        <p>
                            These are your upcoming schedule for the next{' '}
                            {Math.ceil(
                                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-[#006C50]"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
                <div className="flex flex-row mb-6 space-x-4">
                    <div className="flex flex-col">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={format(startDate, 'yyyy-MM-dd')}
                            onChange={handleDateRangeChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={format(endDate, 'yyyy-MM-dd')}
                            onChange={handleDateRangeChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>
                </div>
                {userSchedule.length == 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500">
                        <AlertCircle size={48} className="mx-auto mb-4" />
                        <p className="text-lg">You have no schedule!</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto">
                        {userSchedule.map((event, index) => (
                            <div
                                key={index}
                                className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center mb-2">
                                    <Calendar className="text-[#006C50] mr-2" size={16} />
                                    <span className="font-semibold">{event.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="text-[#006C50] mr-2" size={14} />
                                    <span>
                                        {event.date} - {event.time}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    <strong>Description:</strong> {event.description}
                                </div>
                                {event.case && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Case to send:</strong> {event.case.title}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Popup

import {
	AlertCircle,
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Star,
	Users,
	XCircle,
	Plus,
	Phone,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Typography } from "@/components/ui";
import { mockCalendarEvents } from "@/data/calendarData";
import { cn } from "@/utils/cn";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	formatTemporalDateTime,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
	subMonths,
	toJSDate,
} from "@/utils/temporal";

const CalendarPage = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [filterType, _setFilterType] = useState<string>("all");
	const [searchTerm, _setSearchTerm] = useState("");

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
	const monthDays = eachDayOfInterval({
		start: calendarStart,
		end: calendarEnd,
	});

	const filteredEvents = mockCalendarEvents.filter((event) => {
		const matchesType = filterType === "all" || event.type === filterType;
		const matchesSearch =
			searchTerm === "" ||
			event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			event.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			event.description?.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesType && matchesSearch;
	});

	const getEventsForDate = (date: Date) => {
		return filteredEvents.filter((event) =>
			isSameDay(toJSDate(event.startDate), date),
		);
	};

	const getEventTypeInfo = (type: string) => {
		const types = {
			consultation: {
				label: "전화상담",
				icon: Phone,
				variant: "primary" as const,
			},
			placement_test: {
				label: "배치고사",
				icon: FileText,
				variant: "success" as const,
			},
			special: {
				label: "특별일정",
				icon: Star,
				variant: "primary" as const,
			},
			follow_up: {
				label: "후속관리",
				icon: Users,
				variant: "warning" as const,
			},
		};
		return (
			types[type as keyof typeof types] || {
				label: "기타",
				icon: AlertCircle,
				variant: "default" as const,
			}
		);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-[var(--color-green)]" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-[var(--color-red)]" />;
			default:
				return <Clock className="h-4 w-4 text-[var(--color-primary)]" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "border-l-[var(--color-green)] bg-[var(--color-green)]/10";
			case "cancelled":
				return "border-l-[var(--color-red)] bg-[var(--color-red)]/10";
			default:
				return "border-l-[var(--color-primary)] bg-[var(--color-primary)]/10";
		}
	};

	const navigateMonth = (direction: "prev" | "next") => {
		setCurrentDate(
			direction === "prev"
				? subMonths(currentDate, 1)
				: addMonths(currentDate, 1),
		);
	};

	const todayEvents = getEventsForDate(new Date());
	const upcomingEvents = filteredEvents
		.filter((event) => toJSDate(event.startDate) > new Date())
		.sort(
			(a, b) =>
				toJSDate(a.startDate).getTime() - toJSDate(b.startDate).getTime(),
		)
		.slice(0, 5);

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height))]">
			{/* Main Content Area */}
			<main className="flex-1 bg-gray-50">
				<div className="w-full px-[var(--page-padding-inline)] py-6">
					{/* Page Header */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-[var(--color-primary)]" />
								<Typography variant="h3">일정 관리</Typography>
							</div>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								일정 추가
							</Button>
						</div>
						<Typography variant="body-secondary">
							전화상담, 배치고사, 특별일정을 한눈에 관리하세요
						</Typography>
					</div>

					<div className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Calendar */}
							<div className="lg:col-span-2">
								<Card padding="lg">
									{/* Calendar Header */}
									<div className="flex items-center justify-between mb-6">
										<Typography variant="h3">
											{currentDate.toLocaleDateString("ko-KR", {
												year: "numeric",
												month: "long",
											})}
										</Typography>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => navigateMonth("prev")}
												className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
											>
												<ChevronLeft className="h-5 w-5 text-gray-600" />
											</button>
											<button
												type="button"
												onClick={() => setCurrentDate(new Date())}
												className="px-3 py-2 text-sm bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/30 transition-colors"
											>
												오늘
											</button>
											<button
												type="button"
												onClick={() => navigateMonth("next")}
												className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
											>
												<ChevronRight className="h-5 w-5 text-gray-600" />
											</button>
										</div>
									</div>

									{/* Calendar Grid */}
									<div className="grid grid-cols-7 gap-1 mb-4">
										{["일", "월", "화", "수", "목", "금", "토"].map((day) => (
											<div
												key={day}
												className="p-2 text-center text-sm font-medium text-gray-600"
											>
												{day}
											</div>
										))}
									</div>

									<div className="grid grid-cols-7 gap-1">
										{monthDays.map((day: Date) => {
											const dayEvents = getEventsForDate(day);
											const isSelected =
												selectedDate && isSameDay(day, selectedDate);
											const isTodayDate = isToday(day);
											const isCurrentMonth = isSameMonth(day, currentDate);

											return (
												<button
													key={day.toISOString()}
													onClick={() => setSelectedDate(day)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															setSelectedDate(day);
														}
													}}
													type="button"
													tabIndex={0}
													className={cn(
														"min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg",
														isSelected &&
															"bg-[var(--color-primary)]/20 border-[var(--color-primary)]/30",
														isTodayDate &&
															"bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20",
														!isCurrentMonth && "opacity-50",
													)}
												>
													<div
														className={cn(
															"text-sm font-medium mb-1",
															isTodayDate
																? "text-[var(--color-primary)]"
																: isCurrentMonth
																	? "text-gray-900"
																	: "text-gray-600",
														)}
													>
														{day.getDate()}
													</div>
													<div className="space-y-1">
														{dayEvents.slice(0, 2).map((event) => (
															<div
																key={event.id}
																className="text-xs p-1 rounded text-white truncate"
																style={{ backgroundColor: event.color }}
																title={event.title}
															>
																{event.title}
															</div>
														))}
														{dayEvents.length > 2 && (
															<Typography variant="small" className="text-xs">
																+{dayEvents.length - 2}개 더
															</Typography>
														)}
													</div>
												</button>
											);
										})}
									</div>
								</Card>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								{/* Selected Date Events */}
								{selectedDate && (
									<Card padding="md">
										<Typography variant="h3" className="mb-4">
											{selectedDate.toLocaleDateString("ko-KR", {
												month: "long",
												day: "numeric",
												weekday: "short",
											})}{" "}
											일정
										</Typography>
										<div className="space-y-3">
											{getEventsForDate(selectedDate).map((event) => {
												const typeInfo = getEventTypeInfo(event.type);
												const Icon = typeInfo.icon;

												return (
													<Card
														key={event.id}
														padding="sm"
														className={cn(
															"border-l-4",
															getStatusColor(event.status),
														)}
													>
														<div className="flex items-start justify-between mb-2">
															<div className="flex items-center gap-2">
																<Icon className="h-4 w-4" />
																<Typography
																	variant="small"
																	className="font-medium"
																>
																	{event.title}
																</Typography>
															</div>
															{getStatusIcon(event.status)}
														</div>
														<Typography variant="small" className="mb-1">
															{formatTemporalDateTime(event.startDate, "HH:mm")}{" "}
															- {formatTemporalDateTime(event.endDate, "HH:mm")}
														</Typography>
														{event.description && (
															<Typography variant="small" className="mb-2">
																{event.description}
															</Typography>
														)}
														{event.studentName && (
															<div className="flex items-center justify-between">
																<Badge variant={typeInfo.variant}>
																	{typeInfo.label}
																</Badge>
																<Link
																	to={`/student/${event.studentId}`}
																	className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
																>
																	{event.studentName}
																</Link>
															</div>
														)}
													</Card>
												);
											})}
											{getEventsForDate(selectedDate).length === 0 && (
												<div className="text-center py-8">
													<Calendar className="h-8 w-8 mx-auto mb-2 text-gray-600" />
													<Typography variant="small">
														이 날에는 일정이 없습니다
													</Typography>
												</div>
											)}
										</div>
									</Card>
								)}

								{/* Upcoming Events */}
								<Card padding="md">
									<Typography variant="h3" className="mb-4">
										다가오는 일정
									</Typography>
									<div className="space-y-3">
										{upcomingEvents.map((event) => {
											const typeInfo = getEventTypeInfo(event.type);
											const Icon = typeInfo.icon;

											return (
												<Card
													key={event.id}
													padding="sm"
													className="bg-gray-50"
												>
													<div className="flex items-center gap-2 mb-1">
														<Icon className="h-4 w-4" />
														<Typography variant="small" className="font-medium">
															{event.title}
														</Typography>
													</div>
													<Typography variant="small" className="mb-2">
														{formatTemporalDateTime(
															event.startDate,
															"MM/dd (E) HH:mm",
														)}
													</Typography>
													{event.studentName && (
														<div className="flex items-center justify-between">
															<Badge variant={typeInfo.variant}>
																{typeInfo.label}
															</Badge>
															<Typography variant="small">
																{event.studentName}
															</Typography>
														</div>
													)}
												</Card>
											);
										})}
										{upcomingEvents.length === 0 && (
											<div className="text-center py-4">
												<Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
												<Typography variant="small">
													예정된 일정이 없습니다
												</Typography>
											</div>
										)}
									</div>
								</Card>

								{/* Today's Events */}
								{todayEvents.length > 0 && (
									<Card padding="md">
										<Typography variant="h3" className="mb-4">
											오늘의 일정
										</Typography>
										<div className="space-y-3">
											{todayEvents.map((event) => {
												const typeInfo = getEventTypeInfo(event.type);
												const Icon = typeInfo.icon;

												return (
													<Card
														key={event.id}
														padding="sm"
														className={cn(
															"border-l-4",
															getStatusColor(event.status),
														)}
													>
														<div className="flex items-start justify-between mb-1">
															<div className="flex items-center gap-2">
																<Icon className="h-4 w-4" />
																<Typography
																	variant="small"
																	className="font-medium"
																>
																	{event.title}
																</Typography>
															</div>
															{getStatusIcon(event.status)}
														</div>
														<Typography variant="small" className="mb-1">
															{formatTemporalDateTime(event.startDate, "HH:mm")}{" "}
															- {formatTemporalDateTime(event.endDate, "HH:mm")}
														</Typography>
														{event.studentName && (
															<div className="flex items-center justify-between">
																<Badge variant={typeInfo.variant}>
																	{typeInfo.label}
																</Badge>
																<Typography variant="small">
																	{event.studentName}
																</Typography>
															</div>
														)}
													</Card>
												);
											})}
										</div>
									</Card>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CalendarPage;

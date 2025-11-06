import {
	AlertCircle,
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Filter,
	Phone,
	Plus,
	Search,
	Star,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { mockCalendarEvents } from "@/data/calendarData";
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
	const [filterType, setFilterType] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
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
				color: "bg-blue-100 text-blue-800",
			},
			placement_test: {
				label: "배치고사",
				icon: FileText,
				color: "bg-green-100 text-green-800",
			},
			special: {
				label: "특별일정",
				icon: Star,
				color: "bg-purple-100 text-purple-800",
			},
			follow_up: {
				label: "후속관리",
				icon: Users,
				color: "bg-amber-100 text-amber-800",
			},
		};
		return (
			types[type as keyof typeof types] || {
				label: "기타",
				icon: AlertCircle,
				color: "bg-gray-100 text-gray-800",
			}
		);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Clock className="h-4 w-4 text-blue-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "border-l-green-500 bg-green-50";
			case "cancelled":
				return "border-l-red-500 bg-red-50";
			default:
				return "border-l-blue-500 bg-blue-50";
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
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
						<p className="text-gray-600 mt-1">
							전화상담, 배치고사, 특별일정을 한눈에 관리하세요
						</p>
					</div>
					<button
						type="button"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						일정 추가
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<Calendar className="h-8 w-8 text-blue-600" />
						<div className="ml-3">
							<div className="text-2xl font-bold text-blue-600">
								{todayEvents.length}
							</div>
							<div className="text-sm text-blue-800">오늘 일정</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<Phone className="h-8 w-8 text-green-600" />
						<div className="ml-3">
							<div className="text-2xl font-bold text-green-600">
								{
									filteredEvents.filter(
										(e) =>
											e.type === "consultation" && e.status === "scheduled",
									).length
								}
							</div>
							<div className="text-sm text-green-800">예정 상담</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<FileText className="h-8 w-8 text-purple-600" />
						<div className="ml-3">
							<div className="text-2xl font-bold text-purple-600">
								{
									filteredEvents.filter(
										(e) =>
											e.type === "placement_test" && e.status === "scheduled",
									).length
								}
							</div>
							<div className="text-sm text-purple-800">예정 시험</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<Users className="h-8 w-8 text-amber-600" />
						<div className="ml-3">
							<div className="text-2xl font-bold text-amber-600">
								{
									filteredEvents.filter(
										(e) => e.type === "follow_up" && e.status === "scheduled",
									).length
								}
							</div>
							<div className="text-sm text-amber-800">후속 관리</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							placeholder="일정 제목, 학생 이름으로 검색..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-gray-400" />
						<select
							value={filterType}
							onChange={(e) => setFilterType(e.target.value)}
							className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="all">전체 일정</option>
							<option value="consultation">전화상담</option>
							<option value="placement_test">배치고사</option>
							<option value="special">특별일정</option>
							<option value="follow_up">후속관리</option>
						</select>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Calendar */}
				<div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
					{/* Calendar Header */}
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-lg font-semibold text-gray-900">
							{currentDate.toLocaleDateString("ko-KR", {
								year: "numeric",
								month: "long",
							})}
						</h2>
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
								className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
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
							const isSelected = selectedDate && isSameDay(day, selectedDate);
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
									className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
										isSelected ? "bg-blue-50 border-blue-200" : ""
									} ${isTodayDate ? "bg-blue-100 border-blue-300" : ""} ${
										!isCurrentMonth ? "bg-gray-50" : ""
									}`}
								>
									<div
										className={`text-sm font-medium mb-1 ${
											isTodayDate
												? "text-blue-700"
												: isCurrentMonth
													? "text-gray-900"
													: "text-gray-400"
										}`}
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
											<div className="text-xs text-gray-500">
												+{dayEvents.length - 2}개 더
											</div>
										)}
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Selected Date Events */}
					{selectedDate && (
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{selectedDate.toLocaleDateString("ko-KR", {
									month: "long",
									day: "numeric",
									weekday: "short",
								})}{" "}
								일정
							</h3>
							<div className="space-y-3">
								{getEventsForDate(selectedDate).map((event) => {
									const typeInfo = getEventTypeInfo(event.type);
									const Icon = typeInfo.icon;

									return (
										<div
											key={event.id}
											className={`p-3 rounded-lg border-l-4 ${getStatusColor(
												event.status,
											)}`}
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													<Icon className="h-4 w-4" />
													<span className="font-medium text-sm">
														{event.title}
													</span>
												</div>
												{getStatusIcon(event.status)}
											</div>
											<div className="text-xs text-gray-600 mb-1">
												{formatTemporalDateTime(event.startDate, "HH:mm")} -{" "}
												{formatTemporalDateTime(event.endDate, "HH:mm")}
											</div>
											{event.description && (
												<div className="text-xs text-gray-600 mb-2">
													{event.description}
												</div>
											)}
											{event.studentName && (
												<div className="flex items-center justify-between">
													<span
														className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}
													>
														{typeInfo.label}
													</span>
													<Link
														to={`/student/${event.studentId}`}
														className="text-xs text-blue-600 hover:text-blue-700"
													>
														{event.studentName}
													</Link>
												</div>
											)}
										</div>
									);
								})}
								{getEventsForDate(selectedDate).length === 0 && (
									<div className="text-center py-8 text-gray-500">
										<Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
										<p className="text-sm">이 날에는 일정이 없습니다</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Upcoming Events */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							다가오는 일정
						</h3>
						<div className="space-y-3">
							{upcomingEvents.map((event) => {
								const typeInfo = getEventTypeInfo(event.type);
								const Icon = typeInfo.icon;

								return (
									<div key={event.id} className="p-3 bg-gray-50 rounded-lg">
										<div className="flex items-center gap-2 mb-1">
											<Icon className="h-4 w-4" />
											<span className="font-medium text-sm">{event.title}</span>
										</div>
										<div className="text-xs text-gray-600 mb-2">
											{formatTemporalDateTime(
												event.startDate,
												"MM/dd (E) HH:mm",
											)}
										</div>
										{event.studentName && (
											<div className="flex items-center justify-between">
												<span
													className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}
												>
													{typeInfo.label}
												</span>
												<span className="text-xs text-gray-600">
													{event.studentName}
												</span>
											</div>
										)}
									</div>
								);
							})}
							{upcomingEvents.length === 0 && (
								<div className="text-center py-4 text-gray-500">
									<Clock className="h-6 w-6 mx-auto mb-2 text-gray-300" />
									<p className="text-sm">예정된 일정이 없습니다</p>
								</div>
							)}
						</div>
					</div>

					{/* Today's Events */}
					{todayEvents.length > 0 && (
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								오늘의 일정
							</h3>
							<div className="space-y-3">
								{todayEvents.map((event) => {
									const typeInfo = getEventTypeInfo(event.type);
									const Icon = typeInfo.icon;

									return (
										<div
											key={event.id}
											className={`p-3 rounded-lg border-l-4 ${getStatusColor(
												event.status,
											)}`}
										>
											<div className="flex items-start justify-between mb-1">
												<div className="flex items-center gap-2">
													<Icon className="h-4 w-4" />
													<span className="font-medium text-sm">
														{event.title}
													</span>
												</div>
												{getStatusIcon(event.status)}
											</div>
											<div className="text-xs text-gray-600 mb-1">
												{formatTemporalDateTime(event.startDate, "HH:mm")} -{" "}
												{formatTemporalDateTime(event.endDate, "HH:mm")}
											</div>
											{event.studentName && (
												<div className="flex items-center justify-between">
													<span
														className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}
													>
														{typeInfo.label}
													</span>
													<span className="text-xs text-gray-600">
														{event.studentName}
													</span>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CalendarPage;

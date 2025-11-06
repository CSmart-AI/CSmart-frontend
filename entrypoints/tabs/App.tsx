import { Route, HashRouter as Router, Routes } from "react-router-dom";
import Layout from "../../components/Layout.tsx";
import CalendarPage from "./CalendarPage.tsx";
import ConsultationPage from "./ConsultationPage.tsx";
import ManagementPage from "./ManagementPage.tsx";
import RegistrationPage from "./RegistrationPage.tsx";
import StudentDetailPage from "./StudentDetailPage.tsx";

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<ConsultationPage />} />
					<Route path="/consultation" element={<ConsultationPage />} />
					<Route path="/registration" element={<RegistrationPage />} />
					<Route path="/management" element={<ManagementPage />} />
					<Route path="/calendar" element={<CalendarPage />} />
					<Route path="/student/:id" element={<StudentDetailPage />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;

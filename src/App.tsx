import "./app.css";
import Waitlist from "./pages/Waitlist";
import Demo from "./pages/Demo";
import LandingPage from "./pages/LandingPage";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallBack";
import AuthDialog from "./pages/AuthDialog";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CreateSession from "./pages/CreateSession";
import SessionHistory from "./pages/SessionHistory";
import { requireAuth } from "./scripts/auth.loaders";
import { getCallDetails } from "./scripts/session.loader";
// import SessionCall from "./pages/SessionCall";
import SessionCallPage from "./pages/SessionCallPage";
import ScheduledSession from "./pages/ScheduledSession";
import Notes from "./pages/Notes";
import SessionMaterials from "./pages/SessionMaterials";

const router = createBrowserRouter([
	{
		path: "/",
		element: <LandingPage />,
		children: [
			{
				path: "/auth",
				element: <AuthDialog />,
			},
		],
	},
	{
		path: "/demo",
		element: <Demo />,
	},
	{
		path: "/waitlist",
		element: <Waitlist />,
	},
	{
		path: "/dashboard",
		loader: requireAuth,
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: <Dashboard />,
			},
			{
				path: "/dashboard/session/create",
				element: <CreateSession />,
			},
			{
				path: "/dashboard/session/history",
				element: <SessionHistory />,
			},
			{
				path: "/dashboard/session/scheduled",
				element: <ScheduledSession />,
			},
			{
				path: "/dashboard/session/notes",
				element: <Notes />,
			},
			{
				path: "/dashboard/session/materials",
				element: <SessionMaterials />,
			},
		],
	},
	{
		path: "/auth/callback",
		element: <AuthCallback />,
	},
	// {
	// 	path: "/session/call/:id",
	// 	element: <SessionCall />,
	// },
	{
		path: "/session/call/:id",
		loader: getCallDetails,
		element: <SessionCallPage />,
	},
]);

export default function App() {
	return (
		<>
			<Toaster />
			<RouterProvider router={router} />
		</>
	);
}

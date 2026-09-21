import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Stats,
  AllJobs,
  Profile,
  Admin,
  EditJob,
  DashboardHome,
  CandidateProfile,
  BrowseJobs,
  MyApplications,
  JobApplicants,
  Interviews,
  Analytics,
} from './pages';

import { action as registerAction } from './pages/Register';
import { action as loginAction } from './pages/Login';
import { loader as dashboardLoader } from './pages/DashboardLayout';
import { action as addJobAction } from './pages/AddJob';
import { loader as allJobsLoader } from './pages/AllJobs';
import { loader as editJobLoader } from './pages/EditJob';
import { action as editJobAction } from './pages/EditJob';
import { action as deleteJobAction } from './pages/DeleteJob';
import { loader as adminLoader } from './pages/Admin';
import { action as profileAction } from './pages/Profile';
import { loader as statsLoader } from './pages/Stats';

// RecruitHub loaders/actions
import { loader as dashboardHomeLoader } from './pages/DashboardHome';
import {
  loader as candidateProfileLoader,
  action as candidateProfileAction,
} from './pages/CandidateProfile';
import { loader as browseJobsLoader } from './pages/BrowseJobs';
import { loader as myApplicationsLoader } from './pages/MyApplications';
import { loader as jobApplicantsLoader } from './pages/JobApplicants';
import { loader as interviewsLoader } from './pages/Interviews';
import { loader as analyticsLoader } from './pages/Analytics';

import ErrorElement from './components/ErrorElement';

export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  return isDarkTheme;
};

checkDefaultTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'register',
        element: <Register />,
        action: registerAction,
      },
      {
        path: 'login',
        element: <Login />,
        action: loginAction(queryClient),
      },
      {
        path: 'dashboard',
        element: <DashboardLayout queryClient={queryClient} />,
        loader: dashboardLoader(queryClient),
        children: [
          {
            index: true,
            element: <DashboardHome />,
            loader: dashboardHomeLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'add-job',
            element: <AddJob />,
            action: addJobAction(queryClient),
          },
          {
            path: 'all-jobs',
            element: <AllJobs />,
            loader: allJobsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'jobs/:id/applicants',
            element: <JobApplicants />,
            loader: jobApplicantsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
            loader: analyticsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'interviews',
            element: <Interviews />,
            loader: interviewsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'browse-jobs',
            element: <BrowseJobs />,
            loader: browseJobsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'my-applications',
            element: <MyApplications />,
            loader: myApplicationsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'candidate-profile',
            element: <CandidateProfile />,
            loader: candidateProfileLoader(queryClient),
            action: candidateProfileAction(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'stats',
            element: <Stats />,
            loader: statsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'profile',
            element: <Profile />,
            action: profileAction(queryClient),
          },
          {
            path: 'admin',
            element: <Admin />,
            loader: adminLoader,
          },
          {
            path: 'edit-job/:id',
            element: <EditJob />,
            loader: editJobLoader(queryClient),
            action: editJobAction(queryClient),
          },
          { path: 'delete-job/:id', action: deleteJobAction(queryClient) },
        ],
      },
    ],
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
export default App;

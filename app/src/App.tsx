import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { Chat } from './pages/Chat';
import { ChatList } from './pages/ChatList';
import { Delivery } from './pages/Delivery';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { RichMenus } from './pages/RichMenus';
import { RichMenuEditor } from './pages/RichMenuEditor';
import { RichMenuPlans } from './pages/RichMenuPlans';
import { DiagnosisList } from './pages/DiagnosisList';
import { DiagnosisEditor } from './pages/DiagnosisEditor';
import { SurveyList } from './pages/SurveyList';
import { SurveyEditor } from './pages/SurveyEditor';
import { SurveyResponses } from './pages/SurveyResponses';
import { FlowBuilder } from './pages/FlowBuilder';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="chat" element={<ChatList />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="templates" element={<Templates />} />
            <Route path="richmenus" element={<RichMenus />} />
            <Route path="richmenus/new" element={<RichMenuEditor />} />
            <Route path="richmenus/plans" element={<RichMenuPlans />} />
            <Route path="richmenus/:id" element={<RichMenuEditor />} />
            <Route path="diagnosis" element={<DiagnosisList />} />
            <Route path="diagnosis/new" element={<DiagnosisEditor />} />
            <Route path="diagnosis/:id" element={<DiagnosisEditor />} />
            <Route path="surveys" element={<SurveyList />} />
            <Route path="surveys/new" element={<SurveyEditor />} />
            <Route path="surveys/:id" element={<SurveyEditor />} />
            <Route path="surveys/:id/responses" element={<SurveyResponses />} />
            <Route path="onboarding" element={<FlowBuilder />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/users/:userId/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


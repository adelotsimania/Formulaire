import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import FormLayout from '../layouts/FormLayout';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
import Adhesion from '../pages/Adhesion';
import Confirmation from '../pages/Confirmation';
import Orientation from '../pages/Orientation';
import Admin from '../pages/Admin';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<FormLayout />}>
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/adhesion" element={<Adhesion />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/orientation" element={<Orientation />} />
      </Route>

      {/* Pas de layout partagé : admin.html n'a ni mini-header ni footer, juste
          le login-box / dashboard en pleine page. */}
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
};

export default AppRoutes;

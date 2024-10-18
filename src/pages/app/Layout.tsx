import { Navigate, Outlet } from "react-router-dom";
import Modal from "../../components/Ui/Modal";
import InternalServerError from "../../components/Ui/InternalServerError";
import useInternalServerError from "../../hooks/useInternalServerError";
import Sidebar from "../../components/App/Sidebar";
import useUpcomingFeature from "../../hooks/useUpcomingFeature";
import UpcomingFeature from "../../components/Ui/UpcomingFeature";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../../lib/apiCenter";
import PrimaryLoader from "../../components/Ui/PrimaryLoader";

const AppLayout = () => {
  const { isInternalServerError, setIsInternalServerError } =
    useInternalServerError();
  const { isOpen, setIsOpen } = useUpcomingFeature();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const authenticate = async () => {
    const result = await isLoggedIn();
    console.log(result);
    if (result.status === "success") {
      setIsAuth(true);
    }
    if (result.status === "fail") {
      setIsAuth(false);
    }
    if (result.status === "error") {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  if (isAuth === null) return <PrimaryLoader />;

  if (isAuth === false) return <Navigate to={"/auth"} replace />;

  return (
    <div className="transition-all duration-500 bg-bg flex flex-row h-screen overflow-hidden">
      <Sidebar />
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <UpcomingFeature close={() => setIsOpen(false)} />
      </Modal>

      <InternalServerError
        open={isInternalServerError}
        onClose={() => setIsInternalServerError(false)}
      />
      <Outlet />
    </div>
  );
};

export default AppLayout;

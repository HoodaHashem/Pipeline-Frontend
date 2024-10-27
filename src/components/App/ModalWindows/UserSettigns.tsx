import Avatar from "../Avatar";
import UserSettingsInput from "../../Ui/UserSettingsInput";
import Button from "../../Ui/Button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  deleteProfilePicture,
  getUserData,
  patchUserData,
  updateProfilePicture,
} from "../../../lib/apiCenter/userService";
import useInternalServerError from "../../../hooks/useInternalServerError";
import {
  IErrorElement,
  IUserData,
  IUserSettings,
} from "../../../lib/interfaces";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoCloudUpload } from "react-icons/io5";
import { API_PUBLIC_URL } from "../../../lib/apiCenter/apiConfig";
import AvatarLoader from "../Loaders/avatarLoader";
import SecondaryLoader from "../../Ui/SecondaryLoader";
import { Navigate } from "react-router-dom";

const UserSettings = ({ onClose }: IUserSettings) => {
  const { setIsInternalServerError } = useInternalServerError();
  const [userData, setUserData] = useState<IUserData | null>({
    fullName: "",
    username: "",
    phone: "",
    email: "",
    photo: "",
  });
  const [orgData, setOrgData] = useState<IUserData | null>();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isbtnLoading, setIsbtnLoading] = useState(false);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors({});
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filterUserData = async () => {
    try {
      setIsLoading(true);
      const user = await getUserData();
      if (user === "Unauthorized") return <Navigate to={"/auth"} replace />;

      if (user.status === "error") {
        setIsInternalServerError(true);
      }
      if (!user.data.photo) user.data.photo = "defaultProfilePhoto.jpg";
      setUserData(user.data);
      setOrgData(user.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfilePic = async () => {
    try {
      setIsLoading(true);
      const result = await deleteProfilePicture();
      if (result === "Unauthorized") return <Navigate to={"/auth"} replace />;

      if (result.status === "error") {
        setIsInternalServerError(true);
      }
      const user = await getUserData();
      if (!user.data.photo) user.data.photo = "defaultProfilePhoto.jpg";

      if (user.status === "error") {
        setIsInternalServerError(true);
      }
      setUserData(user.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      try {
        setIsLoading(true);
        const result = await updateProfilePicture(file);
        if (result.status === "error") {
          setIsInternalServerError(true);
        }
        const user = await getUserData();
        if (result === "Unauthorized") return <Navigate to={"/auth"} replace />;

        if (user === "Unauthorized") return <Navigate to={"/auth"} replace />;

        if (result === "serverDown")
          return <Navigate to={"/server-down"} replace />;

        if (user === "serverDown")
          return <Navigate to={"/server-down"} replace />;

        if (!user.data.photo) user.data.photo = "defaultProfilePhoto.jpg";

        if (user.status === "error") {
          setIsInternalServerError(true);
        }
        setUserData(user.data);
      } catch (err) {
        console.error(err);
      } finally {
        e.target.value = "";
        setIsLoading(false);
        window.location.reload();
      }
    }
  };
  useEffect(() => {
    filterUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const apiData: { [key: string]: string } = {};
    if (
      orgData?.fullName === userData?.fullName?.trim() &&
      userData?.phone === orgData?.phone &&
      userData?.username === orgData?.username &&
      userData?.email === orgData?.email
    ) {
      setErrors({ fullName: "You must edit something" });
      return;
    }
    if (orgData?.fullName !== userData?.fullName) {
      apiData["fullName"] = userData?.fullName ?? "";
    }
    if (orgData?.username !== userData?.username) {
      apiData["username"] = userData?.username ?? "";
    }
    if (orgData?.email !== userData?.email) {
      apiData["email"] = userData?.email ?? "";
    }
    if (orgData?.phone !== userData?.phone) {
      apiData["phone"] = userData?.phone ?? "";
    }
    setIsbtnLoading(true);
    const result = await patchUserData(apiData);
    setIsbtnLoading(false);

    if (result.status === "fail") {
      const errs: { [key: string]: string } = {};
      result.errors.forEach((element: IErrorElement) => {
        errs[element.path] = element.msg;
      });
      setErrors(errs);
    }
    if (result.status === "success") {
      window.location.reload();
    }
    if (result.status === "error") {
      setIsInternalServerError(true);
    }
    if (result === "Unauthorized") return <Navigate to={"/auth"} replace />;
  };
  return (
    <div className="p-5">
      <ul className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-10 mt-4 lg:mt-0">
        <li className="relative cursor-pointer  transition-all duration-300 border-b-2 border-third text-third pointer-events-none">
          User Information
        </li>
      </ul>

      <div className="container flex flex-col justify-center items-center mt-3 w-96">
        <div
          className={`flex justify-center items-center gap-5 ${isLoading ? "animate-pulse" : ""}`}
        >
          <button
            className="gap-1 flex items-center justify-center p-2 bg-slate-500 text-text font-medium rounded-md tracking-wider active:scale-95 transition-all hover:bg-slate-600 duration-300"
            onClick={handleButtonClick}
          >
            <IoCloudUpload />
            Update
          </button>

          {isLoading ? (
            <AvatarLoader size="xl" />
          ) : (
            <Avatar
              src={`${API_PUBLIC_URL + "/" + userData?.photo}`}
              size="xl"
              alt="Profile picture"
            />
          )}

          <button
            className="gap-1 flex items-center justify-center p-2 bg-red-600 text-text font-medium rounded-md tracking-wider active:scale-95 transition-all hover:bg-red-700 duration-300"
            onClick={deleteProfilePic}
          >
            <FaRegTrashAlt />
            Delete
          </button>
        </div>
        <input
          type="file"
          name="avatar"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <form onSubmit={handleEdit}>
          <UserSettingsInput
            isLoading={isLoading}
            name="fullName"
            value={isLoading ? "Loading..." : (userData?.fullName ?? "")}
            onChange={handleFormChange}
            err={!!errors.fullName}
            errMsg={errors.fullName}
          />
          <UserSettingsInput
            isLoading={isLoading}
            name="username"
            value={isLoading ? "Loading..." : (userData?.username ?? "")}
            onChange={handleFormChange}
            err={!!errors.username}
            errMsg={errors.username}
          />
          <UserSettingsInput
            isLoading={isLoading}
            name="email"
            value={isLoading ? "Loading..." : (userData?.email ?? "")}
            onChange={handleFormChange}
            err={!!errors.email}
            errMsg={errors.email}
          />

          <UserSettingsInput
            isLoading={isLoading}
            name="phone"
            value={isLoading ? "Loading..." : (userData?.phone ?? "")}
            onChange={handleFormChange}
            err={!!errors.phone}
            errMsg={errors.phone}
          />
          <div className={`flex ${isLoading ? "animate-pulse " : ""}`}>
            <Button disabled={isLoading} type="submit">
              {isbtnLoading ? <SecondaryLoader /> : "edit"}
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;

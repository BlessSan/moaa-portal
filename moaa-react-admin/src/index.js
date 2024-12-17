import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import AdminAddUser from "./components/AdminAddUser";

const ADMIN_USER_PROFILE_ROOT_DIV = "admin-user-profile-root";
const ADMIN_USER_ADD_ROOT_DIV = "admin-add-user-root";

domReady(() => {
  const addUserRootDiv = document.getElementById(ADMIN_USER_ADD_ROOT_DIV);

  const userProfileDiv = document.getElementById(ADMIN_USER_PROFILE_ROOT_DIV);

  if (addUserRootDiv) {
    const adminAddUserRoot = createRoot(addUserRootDiv);
    adminAddUserRoot.render(<AdminAddUser />);
  } else if (userProfileDiv) {
    const adminUserProfileRoot = createRoot(userProfileDiv);
    adminUserProfileRoot.render(<AdminAddUser />);
  }
});

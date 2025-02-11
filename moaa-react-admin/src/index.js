import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import AdminSettingPage from "./components/AdminSettingsPage";

const ADMIN_MOAA_SETTING_PAGE = "moaa_setting_page_root";

domReady(() => {
  const settingPageDiv = document.getElementById(ADMIN_MOAA_SETTING_PAGE);

  const adminSettingPageRoot = createRoot(settingPageDiv);
  adminSettingPageRoot.render(<AdminSettingPage />);
});
